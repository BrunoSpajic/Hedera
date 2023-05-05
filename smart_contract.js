const { PrivateKey, Client, Hbar, ContractCreateFlow, ContractExecuteTransaction, ContractFunctionParameters,
    ContractCallQuery
} = require("@hashgraph/sdk");

// Acount 1
const account1 = PrivateKey.fromString("302e020100300506032b657004220420d1f669f00fb6343738b73dd07ee29affd695a60e1cfd3a05f55f3e368da0b03d")
const account1Id = "0.0.4567974"

const client = Client.forTestnet();
client.setOperator(account1Id, account1);
client.setDefaultMaxTransactionFee(new Hbar(100));

const contractJson = require("./smart_contract.json");

async function deployContract() {
    const contractTx = await new ContractCreateFlow()
        .setBytecode(contractJson.bytecode)
        .setGas(200_000)
        .execute(client);

    const contractId = (await contractTx.getReceipt(client)).contractId;
    return contractId
}

async function interactWithContractFunction1(contractId) {
    const tx = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(100_000)
        .setFunction("function1", new ContractFunctionParameters().addUint16(4).addUint16(3))
        .execute(client);

    return Buffer.from((await tx.getRecord(client)).contractFunctionResult.bytes).toJSON().data.at(-1)
}

async function interactWithContractFunction2(contractId, n) {
    const tx = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(100_000)
        .setFunction("function2", new ContractFunctionParameters().addUint16(n))
        .execute(client);

    return Buffer.from((await tx.getRecord(client)).contractFunctionResult.bytes).toJSON().data.at(-1)
}

async function main() {
    let contractId = await deployContract();
    console.log(`MyContractId: ${contractId}`)
    let result1 = await interactWithContractFunction1(contractId);
    console.log(`res_1: ${result1}`)
    let result2 = await interactWithContractFunction2(contractId, result1);
    console.log(`res_2: ${result2}`)

    process.exit()
}

main()