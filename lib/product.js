const request = require('./utils/request');
const memoize = require('./utils/memoize');
const cheerio = require('cheerio');
const R = require('ramda');
const htmlToText = require('html-to-text');
import _ from "lodash";

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
    fields.priceStores = this.getPriceStores($, fields);
    this.getInfoRows($, fields);
    fields.documents = this.getDocuments($);
    fields.attributes = this.getAttrRows($, fields);
    return R.map((field) => field === '' ? undefined : field, fields);
  }

  getLead(val) {
    return;
  }

  getRohs(val) {
    return;
  }

  getAmount($) {
    const that = this;
    return;
  }

  getCategory($) {
    let that = this;
    let categoryCnt = $('#breadcrumb li').length;
    let category = that.getData($($('#breadcrumb li')[categoryCnt - 1]).html());
    category = _.trim(category.split('[')[0]);
    return category;
  }

  getDescription($) {
    let that = this;
    let description = '';
    $('.rangeOverview').each(function(i, elem) {
      description += that.getData($(elem).html());
    });
    return description;
  }

  getInfoRows($, initFields) {
    let fields = initFields;
    let infoRows = [];

    try {
      var that = this;
      fields.sku = that.getData($('[itemprop=sku]').html());
      fields.pn = that.getData($('[itemprop=mpn]').html());
      fields.mfs = that.getData($('[itemprop=brand]').html());
      fields.description = that.getDescription($);

      fields.category = that.getCategory($);
    } catch (e) {
      console.error('e:', e.message);
    }
    return fields;
  }

  getData(htmlString) {
    const data = htmlToText.fromString(htmlString, {
      wordwrap: 130
    });
    return data;
  }

  getDocuments($) {
    let that = this;
    let docRows = [];
    let docs = [];
    let docUrl = $('.techRefLink a').attr('onclick').split('\'')[1];
    docs.push(docUrl);
    return docs;
  }

  // 規格
  getAttrRows($, fields) {
    let that = this;
    let attrThRows = [];
    let attrTdRows = [];
    let attrs = [];

    $('.specTableContainer .column2').each(function(i, elem) {
      let title = that.getData($(elem).html());
      let value = that.getData($(elem).next().html());
      if (value) {
        let obj = {};
        obj.key = title;
        obj.value = value;
        attrs.push(obj);

        if (title == '商品信息') fields.description = value;
      }
    });
    return attrs;
  }

  getCurrency($) {
    let that = this;
    let currency = $('[itemprop=priceCurrency]').attr('content');
    return currency;
  }

  getPriceStoresPrice($, elem) {
    return parseInt($(elem).find('span').html());
  }

  getPriceStores($, fields) {
    let that = this;
    fields.currency = that.getCurrency($);
    let priceCollection = [];
    let firstObj = {};
    firstObj.amount = 1;
    firstObj.unitPrice = $('[itemprop=price]').html();
    priceCollection.push(firstObj);

    $('.value-row .breakRangeWithoutUnit').each(function(i, elem) {
      let obj = {};
      obj.amount = that.getPriceStoresPrice($, elem);
      obj.unitPrice = $(elem).next().find('[itemprop=price]').html();
      priceCollection.push(obj);
    });
    return priceCollection;
  }

}
