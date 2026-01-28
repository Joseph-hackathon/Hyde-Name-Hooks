import { expect } from "chai";
import { ethers } from "hardhat";
import { HydeHook, ENSContextRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("HydeHook", function () {
    let hook: HydeHook;
    let registry: ENSContextRegistry;
    let owner: SignerWithAddress;
    let oracle: SignerWithAddress;
    let user: SignerWithAddress;
    let poolId: string;

    beforeEach(async function () {
        [owner, oracle, user] = await ethers.getSigners();

        // Deploy registry
        const ENSContextRegistry = await ethers.getContractFactory("ENSContextRegistry");
        registry = await ENSContextRegistry.deploy(owner.address);
        await registry.waitForDeployment();
        await registry.setBackendOracle(oracle.address);

        // Deploy hook
        const HydeHook = await ethers.getContractFactory("HydeHook");
        hook = await HydeHook.deploy(await registry.getAddress());
        await hook.waitForDeployment();

        // Create pool ID
        poolId = ethers.keccak256(ethers.toUtf8Bytes("ETH-USDC"));
    });

    describe("Pool Configuration", function () {
        it("Should configure pool", async function () {
            const minTier = 1; // Trusted
            const cooldown = 300; // 5 minutes

            await hook.configurePool(poolId, minTier, cooldown);

            const config = await hook.getPoolConfig(poolId);
            expect(config.minTier).to.equal(minTier);
            expect(config.cooldownPeriod).to.equal(cooldown);
            expect(config.isActive).to.be.true;
        });

        it("Should emit PoolConfigured event", async function () {
            await expect(hook.configurePool(poolId, 1, 300))
                .to.emit(hook, "PoolConfigured")
                .withArgs(poolId, 1, 300);
        });
    });

    describe("BeforeSwap - Access Control", function () {
        beforeEach(async function () {
            // Configure pool (Trusted tier required)
            await hook.configurePool(poolId, 1, 300);

            // Register user with Trusted tier
            const ensHash = ethers.keccak256(ethers.toUtf8Bytes("alice.eth"));
            await registry.connect(oracle).registerContext(user.address, ensHash, 1);
        });

        it("Should allow swap for eligible user", async function () {
            const result = await hook.beforeSwap.staticCall(user.address, poolId);
            expect(result).to.be.true;
        });

        it("Should emit SwapExecuted event", async function () {
            await expect(hook.beforeSwap(user.address, poolId))
                .to.emit(hook, "SwapExecuted")
                .withArgs(user.address, poolId, 1);
        });

        it("Should reject unregistered user", async function () {
            const randomUser = ethers.Wallet.createRandom().address;

            await expect(
                hook.beforeSwap(randomUser, poolId)
            ).to.be.revertedWithCustomError(hook, "UserNotRegistered");
        });

        it("Should reject user with insufficient tier", async function () {
            // Register another user with Standard tier
            const lowTierUser = ethers.Wallet.createRandom();
            const ensHash = ethers.keccak256(ethers.toUtf8Bytes("bob.eth"));
            await registry.connect(oracle).registerContext(lowTierUser.address, ensHash, 0);

            await expect(
                hook.beforeSwap(lowTierUser.address, poolId)
            ).to.be.revertedWithCustomError(hook, "InsufficientTier");
        });
    });

    describe("Cooldown Mechanism", function () {
        beforeEach(async function () {
            await hook.configurePool(poolId, 1, 300); // 5 min cooldown

            const ensHash = ethers.keccak256(ethers.toUtf8Bytes("alice.eth"));
            await registry.connect(oracle).registerContext(user.address, ensHash, 1);
        });

        it("Should enforce cooldown period", async function () {
            // First swap
            await hook.beforeSwap(user.address, poolId);

            // Immediate second swap should fail
            await expect(
                hook.beforeSwap(user.address, poolId)
            ).to.be.revertedWithCustomError(hook, "CooldownNotElapsed");
        });

        it("Should allow swap after cooldown", async function () {
            // First swap
            await hook.beforeSwap(user.address, poolId);

            // Fast forward 301 seconds
            await ethers.provider.send("evm_increaseTime", [301]);
            await ethers.provider.send("evm_mine", []);

            // Second swap should succeed
            const result = await hook.beforeSwap.staticCall(user.address, poolId);
            expect(result).to.be.true;
        });
    });

    describe("Pool Management", function () {
        it("Should deactivate pool", async function () {
            await hook.configurePool(poolId, 1, 300);
            await hook.deactivatePool(poolId);

            const config = await hook.getPoolConfig(poolId);
            expect(config.isActive).to.be.false;
        });

        it("Should reject swap in deactivated pool", async function () {
            await hook.configurePool(poolId, 1, 300);

            const ensHash = ethers.keccak256(ethers.toUtf8Bytes("alice.eth"));
            await registry.connect(oracle).registerContext(user.address, ensHash, 1);

            await hook.deactivatePool(poolId);

            await expect(
                hook.beforeSwap(user.address, poolId)
            ).to.be.revertedWithCustomError(hook, "PoolNotActive");
        });
    });

    describe("Can User Swap", function () {
        beforeEach(async function () {
            await hook.configurePool(poolId, 1, 300);

            const ensHash = ethers.keccak256(ethers.toUtf8Bytes("alice.eth"));
            await registry.connect(oracle).registerContext(user.address, ensHash, 1);
        });

        it("Should return true for eligible user", async function () {
            const canSwap = await hook.canUserSwap(user.address, poolId);
            expect(canSwap).to.be.true;
        });

        it("Should return false for unregistered user", async function () {
            const randomUser = ethers.Wallet.createRandom().address;
            const canSwap = await hook.canUserSwap(randomUser, poolId);
            expect(canSwap).to.be.false;
        });

        it("Should return false during cooldown", async function () {
            await hook.beforeSwap(user.address, poolId);

            const canSwap = await hook.canUserSwap(user.address, poolId);
            expect(canSwap).to.be.false;
        });
    });
});
