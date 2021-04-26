##  Installation
To install this application, you'll need
[Node.js](https://nodejs.org/en/download/) 7+ (which comes with
[npm](http://npmjs.com)) and docker installed on your computer  . From your command line:

```
# Clone this repository
$ git clone https://github.com/zyadelhady/tiny-Crypto-Currency.git
```
```
#build image with docker
$ docker build -t tinycryptocurrency .
```
```
#run with docker
$ docker run -p 600:600 -p 3001:3001 -it tinycryptocurrency
```


##  Features
- create Blocks with index, hash, data, transactions, and timestamp.
- Proof-of-work implementation.
- create Wallet with public and private key.
- create Payments between wallets.
- create Transactions signed with the wallet's private key.
- In-memory JavaScript array to store the blockchain.
- Decentralized and distributed peer-to-peer communication.
