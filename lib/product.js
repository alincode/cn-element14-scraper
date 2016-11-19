const request = require('./utils/request');
const memoize = require('./utils/memoize');
const cheerio = require('cheerio');
const R = require('ramda');
const htmlToText = require('html-to-text');
import _ from "lodash";

function getData(htmlString) {
  const data = htmlToText.fromString(htmlString, {
    wordwrap: 130
  });
  return data;
}

export default class Product {
  constructor(html, url) {
    this.html = html;
    this.url = url;
  }

  getResult() {
    if (this.html) return this.parseFields(cheerio.load(this.html));

    const url = this.url;
    var p = new Promise(function(resolve, reject) {
      request(url)
        .then(result => resolve(cheerio.load(result)))
        .catch(reject);
    });
    return p.then(result => {
      return this.parseFields(result)
    });
  }

  parseFields($) {
    let fields = {};
    this.display($);
    fields.priceStores = this.getPriceStores($, fields);
    this.getInfoRows($, fields);
    fields.documents = this.getDocuments($);
    fields.attributes = this.getAttrRows($, fields);
    return R.map((field) => field === '' ? undefined : field, fields);
  }

  getAmount($) {
    const that = this;
    let amount = getData($('.availability').html()).split(' ')[0];
    amount = parseInt(amount.replace(',', ''));
    return amount;
  }

  display($) {
    let that = this;
    $('[itemprop]').each(function(i, elem) {
      let name = $(elem).attr('itemprop');
      let value = getData($(elem).html());
      // console.log(`name:${name}, value:${value}`);
    });
  }

  getCategory($) {
    let that = this;
    let categoryCnt = $('#breadcrumb li').length;
    let category = getData($($('#breadcrumb li')[categoryCnt - 1]).html());
    category = _.trim(category.split('[')[0]);
    return category;
  }

  getDescription($) {
    let that = this;
    let descElement = $('#fnb_features li');
    if (descElement.length == 0) return '';
    let description = '';

    $(descElement).each(function(i, elem) {
      description = description + getData($(elem).html()) + ',';
    });
    return description;
  }

  getInfoRows($, initFields) {
    let fields = initFields;
    let infoRows = [];

    try {
      var that = this;

      $('[itemprop]').each(function(i, elem) {
        let name = $(elem).attr('itemprop');
        let value = getData($(elem).html());
        if (name.indexOf('manufacturer') != -1) fields.mfs = value;
        if (name.indexOf('sku') != -1) fields.sku = value;
        if (name.indexOf('mpn') != -1) fields.pn = value;
      });
      let description = that.getDescription($);
      if (description) fields.description = description;
      fields.category = that.getCategory($);
      fields.amount = this.getAmount($);
    } catch (e) {
      console.error('e:', e.message);
    }
    return fields;
  }

  getDocuments($) {
    let that = this;
    let docRows = [];
    let docs = [];
    let docUrl = $('#technicalData a').attr('href');
    docs.push(docUrl);
    return docs;
  }

  // 規格
  getAttrRows($, fields) {
    let that = this;
    let attrThRows = [];
    let attrTdRows = [];
    let attrs = [];

    $('.pdpProductContent .collapsable-content dt').each(function(i, elem) {
      let title = getData($(elem).html());
      let value = getData($(elem).next().html());
      if (value) {
        let obj = {};
        obj.key = title;
        obj.value = value;
        attrs.push(obj);
      }
    });
    return attrs;
  }

  getCurrency($) {
    let that = this;
    let currency = $('[itemprop=priceCurrency]').html();
    return currency;
  }

  getPriceStoresAmount($, elem) {
    return parseInt(getData($(elem).html()).replace('+', ''));
  }

  getPriceStoresPrice($, elem, currency) {
    let price = getData($(elem).next().html()).replace(
      currency, '');
    return price;
  }

  getPriceStores($, fields) {
    let that = this;
    let currency;
    currency = that.getCurrency($);
    fields.currency = currency;
    let priceCollection = [];
    let firstObj = {};

    $('.tableProductDetailPrice .qty').each(function(i, elem) {
      let obj = {};
      obj.amount = that.getPriceStoresAmount($, elem);
      obj.unitPrice = that.getPriceStoresPrice($, elem, currency);
      priceCollection.push(obj);
    });
    return priceCollection;
  }

}
