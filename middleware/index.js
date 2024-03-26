const Web3 = require('web3')
const md5 = require('md5');
const { create } = require('ipfs-http-client');
const { is } = require('express/lib/request');
var web3 = new Web3();

var pk;
var ipfs;

function accessLog(req, res, next) {
  const { hostname, method, path, ip, protocol } = req;
  console.log(`ACCESS: ${method} ${protocol}://${hostname}${path} - ${ip}`);
  next();
}

function errorLog(err, req, res, next) {
  const { hostname, method, path, protocol } = req.isPrivate;
  console.log(`ERROR: ${method} ${protocol}://${hostname}${path} - ${err}`);
  res.status(500).send({ status: "server-error", message: err.message });
}

function web3api(options){

    
    return async (req, res, next) => {
    
        const md5 = generateMD5Hash(res);
        const sign = signMD5Hash(md5);
        res.setHeader('MD5Hash', md5);
        res.setHeader('Web3Signature', sign); 
        // confirm if the md5 or the actual data is to be uploaded

        if(!(options?.isPrivate)){
            const cid = await uploadToIPFS(md5)
            res.setHeader('IPFS-CID', cid);
        }

        next()
    }
}


function configureWeb3(privateKey, ipfsGateway){
    // probably should encrypt this somehow
    pk = privateKey;
    ipfs = create(ipfsGateway);
}


function generateMD5Hash(response){
    return md5(response);
}

// should have checks for correct length of pk and verify that it is a good pk
function signMD5Hash(data){
    var signature;
    if(pk != null){
        const output = web3.eth.accounts.sign(data, pk);
        signature = output.signature;
    } else {
        res.status(500).send({status: 'server-error', message: 'express-web3 is not correctly configured'})
    }
    return signature
}

function isValidPK(){

}
async function uploadToIPFS(data){
    var cid;
    try {
        const id  = ipfs.id()
        const output = await ipfs.add(data); 
        cid = output.cid;
    } catch (err) {
        console.error('Upload to IPFS failed', err);
    }
    return cid
}

module.exports = { accessLog, errorLog, web3api, configureWeb3 };