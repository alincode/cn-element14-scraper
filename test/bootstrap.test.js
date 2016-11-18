var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var _ = require('lodash');
chai.use(chaiAsPromised);
global.should = chai.should();
global._ = _;

require("babel-core/register");
require("babel-polyfill");
