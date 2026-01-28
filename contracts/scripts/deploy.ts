import { ethers } from "hardhat";

async function main() {
    console.log("🚀 Deploying Hyde Contracts...\n");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());
    console.log();

    // Deploy ENSContextRegistry
    console.log("📝 Deploying ENSContextRegistry...");
    const ENSContextRegistry = await ethers.getContractFactory("ENSContextRegistry");
    const registry = await ENSContextRegistry.deploy(deployer.address);
    await registry.waitForDeployment();
    const registryAddress = await registry.getAddress();
    console.log("✅ ENSContextRegistry deployed to:", registryAddress);
    console.log();

    // Deploy HydeHook
    console.log("📝 Deploying HydeHook...");
    const HydeHook = await ethers.getContractFactory("HydeHook");
    const hook = await HydeHook.deploy(registryAddress);
    await hook.waitForDeployment();
    const hookAddress = await hook.getAddress();
    console.log("✅ HydeHook deployed to:", hookAddress);
    console.log();

    // Configure a sample pool
    console.log("⚙️  Configuring sample pool...");
    const samplePoolId = ethers.keccak256(ethers.toUtf8Bytes("ETH-USDC-POOL"));
    const tx = await hook.configurePool(
        samplePoolId,
        1, // Tier.Trusted (800+)
        300 // 5 minute cooldown
    );
    await tx.wait();
    console.log("✅ Sample pool configured (ETH-USDC, Tier: Trusted, Cooldown: 5min)");
    console.log();

    // Save deployment addresses
    const deployment = {
        network: (await ethers.provider.getNetwork()).name,
        chainId: (await ethers.provider.getNetwork()).chainId,
        deployer: deployer.address,
        contracts: {
            ENSContextRegistry: registryAddress,
            HydeHook: hookAddress,
        },
        samplePools: {
            "ETH-USDC": samplePoolId,
        },
        timestamp: new Date().toISOString(),
    };

    console.log("📄 Deployment Summary:");
    console.log(JSON.stringify(deployment, null, 2));
    console.log();
    console.log("✨ Deployment complete!");
    console.log();
    console.log("Next steps:");
    console.log("1. Update frontend config with contract addresses");
    console.log("2. Configure backend with registry address");
    console.log("3. Set backend oracle address in registry");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
