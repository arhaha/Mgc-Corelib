'use strict';

var _ = require('lodash');
var BlockHeader = require('./blockheader');
var BN = require('../crypto/bn');
var BufferUtil = require('../util/buffer');
var BufferReader = require('../encoding/bufferreader');
var BufferWriter = require('../encoding/bufferwriter');
var Hash = require('../crypto/hash');
var Transaction = require('../transaction');
var $ = require('../util/preconditions');

/**
 * Instantiate a Block from a Buffer, JSON object, or Object with
 * the properties of the Block
 *
 * @param {*} - A Buffer, JSON string, or Object
 * @returns {Block}
 * @constructor
 */
function Block(arg) {
  console.log("################### bitcore lib  Block " + JSON.stringify(arg) );
  if (!(this instanceof Block)) {
    return new Block(arg);
  }
  _.extend(this, Block._from(arg));
  this.header = this.toHeader();
  return this;
}

// https://github.com/bitcoin/bitcoin/blob/b5fa132329f0377d787a4a21c1686609c2bfaece/src/primitives/block.h#L14
Block.MAX_BLOCK_SIZE = 1000000;

/**
 * @param {*} - A Buffer, JSON string or Object
 * @returns {Object} - An object representing block data
 * @throws {TypeError} - If the argument was not recognized
 * @private
 */
Block._from = function _from(arg) {
  console.log("################### bitcore lib  Block _from " + JSON.stringify(arg) );
  var info = {};
  if (BufferUtil.isBuffer(arg)) {
    info = Block._fromBufferReader(BufferReader(arg));
  } else if (_.isObject(arg)) {
    info = Block._fromObject(arg);
  } else {
    throw new TypeError('Unrecognized argument for Block');
  }
  return info;
};

/**
 * @param {Object} - A plain JavaScript object
 * @returns {Object} - An object representing block data
 * @private
 */
Block._fromObject = function _fromObject(data) {
  console.log("################### bitcore lib  Block _fromObject " );
  //var transactions = [];
  //data.transactions.forEach(function(tx) {
  //  if (tx instanceof Transaction) {
  //    transactions.push(tx);
 //   } else {
 //     transactions.push(Transaction().fromObject(tx));
 //   }
 // });
 // var info = {
 //   header: BlockHeader.fromObject(data.header),
 //   transactions: transactions
//  };
  var info = {};
  //console.log("################### bitcore lib  Block _fromObject data.hash : " + data.hash );
  info.hash = data.hash;
  info.version = data.version;
  info.prevHash = data.prevHash;
  info.merkleRoot = data.merkleRoot;
  info.hashMerkleRootWithData = data.hashMerkleRootWithData;
  info.hashMerkleRootWithPrevData = data.hashMerkleRootWithPrevData;
  info.time = data.time;
  info.timestamp = data.timestamp;
  info.bits = data.bits;
  info.nonce = data.nonce;
  info.outpointhash = data.outpointhash;
  info.outpointn = data.outpointn;
  info.blocksigsize = data.blocksigsize;
  info.blocksig = data.blocksig;
  
  var txs = [];
  data.txs.forEach(function(tx) {
    if (tx instanceof Transaction) {
      txs.push(tx);
    } else {
      txs.push(Transaction().fromObject(tx));
    }
  });
  info.txs = txs;
  
  var groupSize = [];
   data.groupSize.forEach(function(sz) {
     groupSize.push(sz);
  });
  info.groupSize = groupSize;
  
  var prevContractData = [];
  data.prevContractData.forEach(function(contract){
	  prevContractData.push(contract);
    }
  )
  info.prevContractData = prevContractData;
  
  return info;
};

/**
 * @param {Object} - A plain JavaScript object
 * @returns {Block} - An instance of block
 */
Block.fromObject = function fromObject(obj) {
  console.log("################### bitcore lib  Block _fromObject " + JSON.stringify(obj) );
  var info = Block._fromObject(obj);
  return new Block(info); 	
};

/**
 * @param {BufferReader} - Block data
 * @returns {Object} - An object representing the block data
 * @private
 */
Block._fromBufferReader = function _fromBufferReader(br) {

  var info = {};
  $.checkState(!br.finished(), 'No block data received');
  //info.header = BlockHeader.fromBufferReader(br);
  //var transactions = br.readVarintNum();
  //info.transactions = [];
  //for (var i = 0; i < transactions; i++) {
  //  info.transactions.push(Transaction().fromBufferReader(br));
  //}
  
  var header = BlockHeader.fromBufferReader(br);
  info.version = header.version;
  info.prevHash = header.prevHash;
  info.merkleRoot = header.merkleRoot;
  info.hashMerkleRootWithData = header.hashMerkleRootWithData;
  info.hashMerkleRootWithPrevData = header.hashMerkleRootWithPrevData;
  info.time = header.time;
  info.bits = header.bits;
  info.nonce = header.nonce;
  info.outpointhash = header.outpointhash;
  info.outpointn = header.outpointn;
  info.blocksigsize = header.blocksigsize;
  info.blocksig = header.blocksig;
  
  var txNum = br.readVarintNum();
  info.txs = [];
  console.log("################### bitcore lib  Block _fromBufferReader txNum " + txNum );
  for (var i = 0; i < txNum; i++) {
    info.txs.push(Transaction().fromBufferReader(br));
  }
  
  var groupSizeNum = br.readVarintNum();
  info.groupSize = [];
  console.log("################### bitcore lib  Block _fromBufferReader groupSizeNum " + groupSizeNum );
  for (var j = 0; j < groupSizeNum; j++) {
    info.groupSize.push(br.readUInt16LE());
  }
  
  var prevContractDataNum = br.readVarintNum();
  info.prevContractData = [];
  console.log("################### bitcore lib  Block _fromBufferReader prevContractDataNum " + prevContractDataNum );
  for (var k = 0; k < prevContractDataNum; k++) {
  }
  
  return info;
};

/**
 * @param {BufferReader} - A buffer reader of the block
 * @returns {Block} - An instance of block
 */
Block.fromBufferReader = function fromBufferReader(br) {
  console.log("################### bitcore lib  Block fromBufferReader " + JSON.stringify(br) );
  $.checkArgument(br, 'br is required');
  var info = Block._fromBufferReader(br);
  return new Block(info);
};

/**
 * @param {Buffer} - A buffer of the block
 * @returns {Block} - An instance of block
 */
Block.fromBuffer = function fromBuffer(buf) {
  console.log("################### bitcore lib  Block fromBuffer "  );
  return Block.fromBufferReader(new BufferReader(buf));
};

/**
 * @param {string} - str - A hex encoded string of the block
 * @returns {Block} - A hex encoded string of the block
 */
Block.fromString = function fromString(str) {
  var buf = new Buffer(str, 'hex');
  return Block.fromBuffer(buf);
};

/**
 * @param {Binary} - Raw block binary data or buffer
 * @returns {Block} - An instance of block
 */
Block.fromRawBlock = function fromRawBlock(data) {
  console.log("################### bitcore lib  Block fromRawBlock " + JSON.stringify(data) );
  if (!BufferUtil.isBuffer(data)) {
    data = new Buffer(data, 'binary');
  }
  var br = BufferReader(data);
  br.pos = Block.Values.START_OF_BLOCK;
  var info = Block._fromBufferReader(br);
  return new Block(info);
};

/**
 * @returns {Object} - A plain object with the block properties
 */
Block.prototype.toObject = Block.prototype.toJSON = function toObject() {
  /*
  var transactions = [];
  this.transactions.forEach(function(tx) {
    transactions.push(tx.toObject());
  });
  return {
    header: this.header.toObject(),
    transactions: transactions
  };
  */
  //console.log("################### bitcore lib  Block toObject hash: " + this.hash );
  var txs = [];
  this.txs.forEach(function(tx) {
    if (tx instanceof Transaction) {
      txs.push(tx);
    } else {
      txs.push(Transaction().fromObject(tx));
    }
  });
  
  var groupSize = [];
  this.groupSize.forEach(function(sz) {
     groupSize.push(sz);
  });
  
  var prevContractData = [];
  this.prevContractData.forEach(function(contract){
	  prevContractData.push(contract);
    }
  )
  
  return {
	hash: this.hash,
    version: this.version,
    prevHash: BufferUtil.reverse(this.prevHash).toString('hex'),
    merkleRoot: BufferUtil.reverse(this.merkleRoot).toString('hex'),
	hashMerkleRootWithData: BufferUtil.reverse(this.hashMerkleRootWithData).toString('hex'),
	hashMerkleRootWithPrevData: BufferUtil.reverse(this.hashMerkleRootWithPrevData).toString('hex'),
    time: this.time,
    bits: this.bits,
    nonce: this.nonce,
	outpointhash: this.outpointhash,
	outpointn: this.outpointn,
	blocksigsize: this.blocksigsize,
	blocksig: this.blocksig,
	txs:txs,
	groupSize:groupSize,
	prevContractData:prevContractData
  }
};

Block.prototype.toHeader = function toHeader(){
	return BlockHeader.fromObject(this);
}
/**
 * @returns {Buffer} - A buffer of the block
 */
Block.prototype.toBuffer = function toBuffer() {
  return this.toBufferWriter().concat();
};

Block.prototype.toHeaderBuffer = function toHeaderBuffer() {
  return this.toHeaderBufferWriter().concat();
};

/**
 * @returns {string} - A hex encoded string of the block
 */
Block.prototype.toString = function toString() {
  return this.toBuffer().toString('hex');
};

/**
 * @param {BufferWriter} - An existing instance of BufferWriter
 * @returns {BufferWriter} - An instance of BufferWriter representation of the Block
 */
Block.prototype.toBufferWriter = function toBufferWriter(bw) {
  /*
  if (!bw) {
    bw = new BufferWriter();
  }
  bw.write(this.header.toBuffer());
  bw.writeVarintNum(this.transactions.length);
  for (var i = 0; i < this.transactions.length; i++) {
    this.transactions[i].toBufferWriter(bw);
  }
  */
  if (!bw) {
    bw = new BufferWriter();
  }
  bw.writeInt32LE(this.version);
  bw.write(this.prevHash);
  bw.write(this.merkleRoot);
  bw.write(this.hashMerkleRootWithData);
  bw.write(this.hashMerkleRootWithPrevData);
  bw.writeUInt32LE(this.time);
  bw.writeUInt32LE(this.bits);
  bw.writeUInt32LE(this.nonce);
  bw.write(this.outpointhash);
  bw.writeInt32LE(this.outpointn);
  bw.writeVarintNum(this.blocksigsize);
  bw.write(this.blocksig);
  
  bw.writeVarintNum(this.txs.length);
  for (var i = 0; i < this.txs.length; i++) {
    this.txs[i].toBufferWriter(bw);
  }
  
  bw.writeVarintNum(this.groupSize.length);
  for (var j = 0; j < this.groupSize.length; j++) {
	bw.writeUInt16LE(this.groupSize[j]);
  }
  
  bw.writeVarintNum(this.prevContractData.length);
  for (var k = 0; k < this.prevContractData.length; k++) {
	//todo contract
  }
  
  return bw;
};

Block.prototype.toHeaderBufferWriter = function toHeaderBufferWriter(bw) {
  
  if (!bw) {
    bw = new BufferWriter();
  }
  bw.writeInt32LE(this.version);
  bw.write(this.prevHash);
  bw.write(this.merkleRoot);
  bw.write(this.hashMerkleRootWithData);
  bw.write(this.hashMerkleRootWithPrevData);
  bw.writeUInt32LE(this.time);
  bw.writeUInt32LE(this.bits);
  bw.writeUInt32LE(this.nonce);
  bw.write(this.outpointhash);
  bw.writeInt32LE(this.outpointn);
  bw.writeVarintNum(this.blocksigsize);
  bw.write(this.blocksig);

  return bw;
};

/**
 * Will iterate through each transaction and return an array of hashes
 * @returns {Array} - An array with transaction hashes
 */
Block.prototype.getTransactionHashes = function getTransactionHashes() {
  /*
  var hashes = [];
  if (this.transactions.length === 0) {
    return [Block.Values.NULL_HASH];
  }
  for (var t = 0; t < this.transactions.length; t++) {
    hashes.push(this.transactions[t]._getHash());
  }
  */
  
  var hashes = [];
  if (this.txs.length === 0) {
    return [Block.Values.NULL_HASH];
  }
  for (var i = 0; i < this.txs.length; i++) {
    hashes.push(this.txs[i]._getHash());
  }
  
  return hashes;
};

/**
 * Will build a merkle tree of all the transactions, ultimately arriving at
 * a single point, the merkle root.
 * @link https://en.bitcoin.it/wiki/Protocol_specification#Merkle_Trees
 * @returns {Array} - An array with each level of the tree after the other.
 */
Block.prototype.getMerkleTree = function getMerkleTree() {

  var tree = this.getTransactionHashes();

  /*
  var j = 0;
  for (var size = this.transactions.length; size > 1; size = Math.floor((size + 1) / 2)) {
    for (var i = 0; i < size; i += 2) {
      var i2 = Math.min(i + 1, size - 1);
      var buf = Buffer.concat([tree[j + i], tree[j + i2]]);
      tree.push(Hash.sha256sha256(buf));
    }
    j += size;
  }
  */
  var j = 0;
  for (var size = this.txs.length; size > 1; size = Math.floor((size + 1) / 2)) {
    for (var i = 0; i < size; i += 2) {
      var i2 = Math.min(i + 1, size - 1);
      var buf = Buffer.concat([tree[j + i], tree[j + i2]]);
      tree.push(Hash.sha256sha256(buf));
    }
    j += size;
  }
  
  return tree;
};

/**
 * Calculates the merkleRoot from the transactions.
 * @returns {Buffer} - A buffer of the merkle root hash
 */
Block.prototype.getMerkleRoot = function getMerkleRoot() {
  var tree = this.getMerkleTree();
  return tree[tree.length - 1];
};

/**
 * Verifies that the transactions in the block match the header merkle root
 * @returns {Boolean} - If the merkle roots match
 */
Block.prototype.validMerkleRoot = function validMerkleRoot() {

  var h = new BN(this.header.merkleRoot.toString('hex'), 'hex');
  var c = new BN(this.getMerkleRoot().toString('hex'), 'hex');

  if (h.cmp(c) !== 0) {
    return false;
  }

  return true;
};

/**
 * @returns {Buffer} - The little endian hash buffer of the header
 */
Block.prototype._getHash = function() {
  //return this.header._getHash();
  var buf = this.toHeaderBuffer();
  return Hash.sha256sha256(buf);
};

var idProperty = {
  configurable: false,
  enumerable: true,
  /**
   * @returns {string} - The big endian hash buffer of the header
   */
  get: function() {
    if (!this._id) {
      //this._id = this.header.id;
	   this._id = BufferReader(this._getHash()).readReverse().toString('hex');
    }
    return this._id;
  },
  set: _.noop
};
Object.defineProperty(Block.prototype, 'id', idProperty);
Object.defineProperty(Block.prototype, 'hash', idProperty);

/**
 * @returns {string} - A string formatted for the console
 */
Block.prototype.inspect = function inspect() {
  return '<Block ' + this.id + '>';
};

Block.Values = {
  START_OF_BLOCK: 8, // Start of block in raw block data
  NULL_HASH: new Buffer('0000000000000000000000000000000000000000000000000000000000000000', 'hex')
};

module.exports = Block;
