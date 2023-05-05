const { PrivateKey, Client, TokenCreateTransaction, Hbar, TokenType, TokenSupplyType, TokenAssociateTransaction, TransferTransaction, TokenPauseTransaction, TokenUnpauseTransaction, CustomRoyaltyFee, CustomFixedFee, TokenMintTransaction } = require("@hashgraph/sdk");

// Acount 1
const account1 = PrivateKey.fromString("302e020100300506032b657004220420d1f669f00fb6343738b73dd07ee29affd695a60e1cfd3a05f55f3e368da0b03d")
const account1Id = "0.0.4567974"

// Acount 2
const account2 = PrivateKey.fromString("302e020100300506032b65700422042006d78ca09457cf69510a4cc9cd63d121e057c1399f89e9e812b8720febd6bcf9")
const account2Id = "0.0.4567975"

// Acount 3
const account3 = PrivateKey.fromString("302e020100300506032b657004220420b45d15ed609de142e7354ce9330373bdf9f8ac382e4a12895411a9f1f55aa5da")
const account3Id = "0.0.4567976"


const client = Client.forTestnet();
client.setOperator(account1Id, account1);
client.setDefaultMaxTransactionFee(new Hbar(100));

async function createToken() {
    const customFee = new CustomRoyaltyFee({
        feeCollectorAccountId: account2Id,
        fallbackFee: new CustomFixedFee().setHbarAmount(new Hbar(200)),
        numerator: 10,
        denominator: 100
    })

    const tx = await new TokenCreateTransaction()
        .setTokenName("Bs Hedera Token")
        .setTokenSymbol("Bs")
        .setTokenType(TokenType.NonFungibleUnique)
        .setSupplyType(TokenSupplyType.Finite)
        .setInitialSupply(0)
        .setMaxSupply(5)
        .setDecimals(0)
        .setTreasuryAccountId(account1Id)
        .setAdminKey(account1)
        .setPauseKey(account1)
        .setSupplyKey(account2)
        .setCustomFees([customFee])
        .freezeWith(client)
        .sign(account1);

    const txSubmit = await tx.execute(client);
    const receipt = await txSubmit.getReceipt(client);
    console.log(`Created token: ${receipt.tokenId}`);
    return receipt.tokenId.toString();
}

async function allowRecive(tokenId, accountId, accountKey) {
    const tx = await new TokenAssociateTransaction()
        .setAccountId(accountId)
        .setTokenIds([tokenId])
        .freezeWith(client)
        .sign(accountKey);

    const txSubmit = await tx.execute(client);
    return await txSubmit.getReceipt(client)
}

/* async function transferTokens(tokenId, accountId, amount) {
    const tx = await new TransferTransaction()
        .addTokenTransfer(tokenId, account1Id, -amount)
        .addTokenTransfer(tokenId, accountId, amount)
        .execute(client);

    const txSubmit = await tx.getReceipt(client);
    return txSubmit
} */

async function mintToken(tokenId) {
    const receipts = [];

    for await (const iterator of Array.apply(null, Array(5)).map((x, i) => i)) {
        const mintTx = new TokenMintTransaction()
            .setTokenId(tokenId)
            .setMetadata([Buffer.from([`NFT ${iterator}`])])
            .freezeWith(client);

        const mintTxSign = await mintTx.sign(account2);
        const mintTxSubmit = await mintTxSign.execute(client);
        const mintRx = await mintTxSubmit.getReceipt(client);

        receipts.push(mintRx);
    }

    return receipts;
}

async function transferTokens(tokenId){
    const txId = await new TransferTransaction()
        .addNftTransfer(tokenId, 2, account1Id, account3Id)
        .execute(client);

    return (await txId.getReceipt(client))
}

async function main() {
    let tokenId = await createToken();
    
    // Allow account3 and account4 to recive token
    await allowRecive(tokenId, account3Id, account3);

     await mintToken(tokenId);
    const tx = await transferTokens(tokenId);
    console.log(tx)

    process.exit()
}

main()