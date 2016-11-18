import fs from 'fs';
import path from 'path';

import {
  ProductFields
}
from './field';

var GrabStrategy = require('../lib/product').default;

function checklist(result) {
  result.sku.should.be.a('string');
  result.mfs.should.be.a('string');
  result.pn.should.be.a('string');
  result.description.should.be.a('string');
  result.documents.should.be.a('array');
  result.documents[0].should.be.a('string');
  result.attributes.should.be.a('array');
  result.attributes.length.should.above(0);
  result.attributes[0].should.have.keys(['key', 'value']);
  result.priceStores.should.be.a('array');
  result.priceStores.length.should.above(0);
  result.priceStores[0].should.have.keys(['amount', 'unitPrice']);
  result.priceStores[0].amount.should.be.a('number');
}

function getHtml(fileName) {
  return new Promise(function(resolve, reject) {
    fs.readFile(path.join(__dirname, fileName), function(err, data) {
      if (err) return console.log(err);
      resolve(data.toString());
    })
  });
}

describe('product page', function() {
  it('case 1', async(done) => {
    try {
      let html = await getHtml(
        'sample.html'
      );
      let grabStrategy = new GrabStrategy(html,
        'http://china.rs-online.com/web/p/igbt-transistors/9195031/'
      );
      let result = await grabStrategy.getResult();
      result.should.have.keys(ProductFields);
      checklist(result);
      done();
    } catch (e) {
      done(e);
    }
  });

  it('case 2', async(done) => {
    try {
      let html = await getHtml(
        'sample2.html'
      );
      let grabStrategy = new GrabStrategy(html,
        'http://china.rs-online.com/web/p/19-inch-cabinets/8020333/'
      );
      let result = await grabStrategy.getResult();
      result.should.have.keys(ProductFields);
      checklist(result);
      done();
    } catch (e) {
      done(e);
    }
  });
});
