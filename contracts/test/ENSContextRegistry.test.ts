import { expect } from "chai";
import { ethers } from "hardhat";
import { ENSContextRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("ENSContextRegistry", function () {
    let registry: ENSContextRegistry;
    let owner: SignerWithAddress;
    let oracle: SignerWithAddress;
    let user: SignerWithAddress;

    beforeEach(async function () {
        [owner, oracle, user] = await ethers.getSigners();

        const ENSContextRegistry = await ethers.getContractFactory("ENSContextRegistry");
        registry = await ENSContextRegistry.deploy(owner.address);
        await registry.waitForDeployment();

        // Set oracle
        await registry.setBackendOracle(oracle.address);
    });

    describe("Deployment", function () {
        it("Should set the correct owner", async function () {
            expect(await registry.owner()).to.equal(owner.address);
        });

        it("Should set the backend oracle", async function () {
            expect(await registry.backendOracle()).to.equal(oracle.address);
        });
    });

    describe("Context Registration", function () {
        it("Should register user context", async function () {
            const ensHash = ethers.keccak256(ethers.toUtf8Bytes("alice.eth"));
            const tier = 1; // Trusted

            await registry.connect(oracle).registerContext(user.address, ensHash, tier);

            expect(await registry.isUserRegistered(user.address)).to.be.true;
            expect(await registry.getUserTier(user.address)).to.equal(tier);
        });

        it("Should reject registration from non-oracle", async function () {
            const ensHash = ethers.keccak256(ethers.toUtf8Bytes("alice.eth"));

            await expect(
                registry.connect(user).registerContext(user.address, ensHash, 1)
            ).to.be.revertedWith("Only oracle can register");
        });

        it("Should emit ContextRegistered event", async function () {
            const ensHash = ethers.keccak256(ethers.toUtf8Bytes("alice.eth"));
            const tier = 1;

            await expect(
                registry.connect(oracle).registerContext(user.address, ensHash, tier)
            )
                .to.emit(registry, "ContextRegistered")
                .withArgs(user.address, ensHash, tier);
        });
    });

    describe("Tier Verification", function () {
        beforeEach(async function () {
            const ensHash = ethers.keccak256(ethers.toUtf8Bytes("alice.eth"));
            await registry.connect(oracle).registerContext(user.address, ensHash, 1);
        });

        it("Should return correct tier", async function () {
            expect(await registry.getUserTier(user.address)).to.equal(1);
        });

        it("Should check minimum tier correctly", async function () {
            expect(await registry.hasMinimumTier(user.address, 0)).to.be.true;
            expect(await registry.hasMinimumTier(user.address, 1)).to.be.true;
            expect(await registry.hasMinimumTier(user.address, 2)).to.be.false;
        });

        it("Should revert when checking tier of unregistered user", async function () {
            const randomUser = ethers.Wallet.createRandom().address;

            await expect(
                registry.getUserTier(randomUser)
            ).to.be.revertedWith("User not registered");
        });
    });

    describe("Tier Updates", function () {
        it("Should update tier and emit event", async function () {
            const ensHash = ethers.keccak256(ethers.toUtf8Bytes("alice.eth"));

            // Initial registration
            await registry.connect(oracle).registerContext(user.address, ensHash, 1);

            // Update to Elite
            await expect(
                registry.connect(oracle).registerContext(user.address, ensHash, 2)
            )
                .to.emit(registry, "TierUpdated")
                .withArgs(user.address, 1, 2);

            expect(await registry.getUserTier(user.address)).to.equal(2);
        });
    });

    describe("Context Deactivation", function () {
        beforeEach(async function () {
            const ensHash = ethers.keccak256(ethers.toUtf8Bytes("alice.eth"));
            await registry.connect(oracle).registerContext(user.address, ensHash, 1);
        });

        it("Should deactivate context", async function () {
            await registry.connect(oracle).deactivateContext(user.address);
            expect(await registry.isUserRegistered(user.address)).to.be.false;
        });

        it("Should allow user to deactivate own context", async function () {
            await registry.connect(user).deactivateContext(user.address);
            expect(await registry.isUserRegistered(user.address)).to.be.false;
        });

        it("Should emit ContextDeactivated event", async function () {
            await expect(
                registry.connect(user).deactivateContext(user.address)
            )
                .to.emit(registry, "ContextDeactivated")
                .withArgs(user.address);
        });
    });
});
