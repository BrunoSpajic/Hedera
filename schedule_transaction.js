
const {
    TransferTransaction,
    Client,
    ScheduleCreateTransaction,
    ScheduleDeleteTransaction,
    ScheduleSignTransaction,
    PrivateKey,
    Hbar
} = require("@hashgraph/sdk");

const myAccountId = "0.0.4567537"
const myPrivateKey = PrivateKey.fromString("302e020100300506032b657004220420d09e7c2e6e89a75352fa13d278ff76d8e518a677c3af850f11a9af3dcbbace9d")

const otherAccountId = "0.0.4567974"
const otherPrivateKey = PrivateKey.fromString("302e020100300506032b657004220420d1f669f00fb6343738b73dd07ee29affd695a60e1cfd3a05f55f3e368da0b03d")
const otherAccountId2 = "0.0.4567975"

const client = Client.forTestnet();

client.setOperator(myAccountId, myPrivateKey);

async function main() {

    //Create a transaction to schedule
    const transferTransaction = new TransferTransaction()
        .addHbarTransfer(otherAccountId, Hbar.fromTinybars(-100))
        .addHbarTransfer(otherAccountId2, Hbar.fromTinybars(100));

    //Schedule a transaction
    const scheduleTransaction = await new ScheduleCreateTransaction()
        .setScheduledTransaction(transferTransaction)
        .setScheduleMemo("My Scheduled Transaction example!")
        .setAdminKey(myPrivateKey)
        .execute(client);

    //Get the receipt of the transaction
    const scheduledTxReceipt = await scheduleTransaction.getReceipt(client);

    //Get the schedule ID
    const scheduleId = scheduledTxReceipt.scheduleId;
    console.log("The schedule ID is " + scheduleId);

    //Get the scheduled transaction ID
    const scheduledTxId = scheduledTxReceipt.scheduledTransactionId;
    console.log("The scheduled transaction ID is " + scheduledTxId);

    //Create the transaction and sign with the admin key
    const transaction = await new ScheduleDeleteTransaction()
        .setScheduleId(scheduleId)
        .freezeWith(client)
        .sign(myPrivateKey);

    //Sign with the operator key and submit to a Hedera network
    const txResponse = await transaction.execute(client);

    //Get the transaction receipt
    const receipt = await txResponse.getReceipt(client);

    //Get the transaction status
    const transactionStatus = receipt.status;
    console.log("The transaction consensus status is " +transactionStatus);

    //Try to execute the deleted scheduled tx
    const scheduledSignTransaction = await new ScheduleSignTransaction()
        .setScheduleId(scheduleId)
        .freezeWith(client)
        .sign(otherPrivateKey);

    const txResponse1 = await scheduledSignTransaction.execute(client);
    const receipt1 = await txResponse1.getReceipt(client);

    //Get the transaction status - should fail
    const transactionStatus1 = receipt1.status;
    console.log("The transaction consensus status is " + transactionStatus1);


    process.exit();
}

main();