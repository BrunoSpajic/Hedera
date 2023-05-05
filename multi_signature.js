const { AccountCreateTransaction, Hbar, Client, PrivateKey, KeyList, TransferTransaction } = require("@hashgraph/sdk")

// Acount 1
const account1 = PrivateKey.fromString("302e020100300506032b657004220420d1f669f00fb6343738b73dd07ee29affd695a60e1cfd3a05f55f3e368da0b03d")
const account1Id = "0.0.4567974"

// Acount 2
const account2 = PrivateKey.fromString("302e020100300506032b65700422042006d78ca09457cf69510a4cc9cd63d121e057c1399f89e9e812b8720febd6bcf9")
const account2Id = "0.0.4567975"

// Acount 3
const account3 = PrivateKey.fromString("302e020100300506032b657004220420b45d15ed609de142e7354ce9330373bdf9f8ac382e4a12895411a9f1f55aa5da")
const account3Id = "0.0.4567976"

// Acount 4
const account4 = PrivateKey.fromString("302e020100300506032b657004220420be16a02c6a4e63b2d3644c6298dbdce1a6072ffbf45a562fa0bc6888b3a5c0c8")
const account4Id = "0.0.4567977"

const client = Client.forTestnet();
client.setOperator(account1Id, account1);

const publicKeys = [
    account1.publicKey,
    account2.publicKey,
    account3.publicKey
]

const newKey = new KeyList(publicKeys, 2)

async function createWallet(){
    let tx = await new AccountCreateTransaction()
        .setKey(newKey)
        .setInitialBalance(new Hbar(20))
        .execute(client);

    return (await tx.getReceipt(client)).accountId

}

async function spendFail(accId){
    const tx = await new TransferTransaction()
        .addHbarTransfer(accId, new Hbar(-10))
        .addHbarTransfer(account4Id, new Hbar(10))
        .freezeWith(client)
        .sign(account1);

    const executed =await (await tx.execute(client)).getReceipt(client);
    return executed
}

async function spend(accId){
    const tx = await (await new TransferTransaction()
        .addHbarTransfer(accId, new Hbar(-10))
        .addHbarTransfer(account4Id, new Hbar(10))
        .freezeWith(client)
        .sign(account1)).sign(account2);

    const executed =await (await tx.execute(client)).getReceipt(client);
    return executed
}

async function main(){
     const accountId = await createWallet();
    
    console.log(accountId)
    await spendFail(accountId).catch((err) => console.error(`Error: ${err}`))
    const tx = await spend(accountId);
    console.log(tx)
    process.exit()
}


main()