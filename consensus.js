const { Client, PrivateKey, TopicCreateTransaction, TopicMessageSubmitTransaction, AccountId, Hbar } = require("@hashgraph/sdk");

// Acount 1
const account1 = PrivateKey.fromString("302e020100300506032b657004220420d1f669f00fb6343738b73dd07ee29affd695a60e1cfd3a05f55f3e368da0b03d")
const account1Id = "0.0.4567974"

// Acount 2
const account2 = PrivateKey.fromString("302e020100300506032b65700422042006d78ca09457cf69510a4cc9cd63d121e057c1399f89e9e812b8720febd6bcf9")
const account2Id = "0.0.4567975"

// Acount 3
const account3 = PrivateKey.fromString("302e020100300506032b657004220420b45d15ed609de142e7354ce9330373bdf9f8ac382e4a12895411a9f1f55aa5da")
const account3Id = "0.0.4567976"

const client = Client.forTestnet()
    .setOperator(account1Id, account1)
    .setDefaultMaxTransactionFee(new Hbar(10));

const client2 = Client.forTestnet()
    .setOperator(account2Id, account2)
    .setDefaultMaxTransactionFee(new Hbar(10));

const client3 = Client.forTestnet()
    .setOperator(account3Id, account3)
    .setDefaultMaxTransactionFee(new Hbar(10));

async function createTopic() {
    let txResponse = await new TopicCreateTransaction()
        .setSubmitKey(account1.publicKey)
        .setSubmitKey(account2.publicKey)
        .execute(client);

    let receipt = await txResponse.getReceipt(client);
    return receipt.topicId.toString()
}

async function send_message(topicId, client) {
    const message = new Date().toISOString();

    const response = await new TopicMessageSubmitTransaction({
        topicId,
        message
    }).execute(client);

    let receipt = await response.getReceipt(client);
    console.log(`\nSent message to topic: ${topicId}, message: ${message}`);
    return receipt.status.toString()
}

async function main() {
    let topicId = await createTopic();
    console.log(`Created topic with id: ${topicId}`)
    console.log(`Look at topic messages: https://hashscan.io/testnet/topic/${topicId}`);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await send_message(topicId, client3).catch((error) => console.log(`Err: ${error}`));
    await send_message(topicId, client2)
    process.exit()
}

main();