var app;

app = new Vue({
  el: '#app',
  data: {
    raw: [],
    data: [],
    bank: '',
    param: 'deposits',
    bank_date: [],
    encoding: {
      x: { field: 'bank', type: 'ordinal' },
      y: { field: 'deposits', type: 'quantitative', aggregate: 'average' }
    }
  },
  methods: {
    filter () {
      this.data = _.filter(this.data, { level: this.level })
    },
    bank_deposit (type) {
      var data = _.filter(this.data, { level: type });
      var deposits = [];
      
      var data = _.reduce(data, (result, item, key) => {
        deposits[item.bank] = !_.isUndefined(deposits[item.bank]) ? deposits[item.bank] + _.toNumber(item[this.param]) : 0;
        result[item.bank] = !_.isUndefined(result[item.bank]) ? deposits[item.bank] : 0;
        return result;
      }, {});

      return _(data).toPairs().orderBy(1, ['desc']).fromPairs().value()
    },
    update_bank_date () {
      var bank = !this.bank ? this.banks[this.types[0]][0] : this.bank;
      var data = _.orderBy(_.filter(this.data, { bank: bank }), 'date', ['asc']);
      this.bank = bank;
      this.bank_date = _.reduce(data, (result, item) => {
        (result || (result = [])).push([item.date, item[this.param]])
        return result;
      }, [])
    }

  },
  computed: {
    types () {
      return _.keys(_.groupBy(this.data, 'level'));
    },
    banks () {
      return _.reduce(this.data, (result, item, key) => {
        if(!_.includes(result[item.level], item.bank) && !!item.bank) {
          (result[item.level] || (result[item.level] = [])).push(item.bank)
        }
        return result
      }, {});
    },
    // bank_date () {
    //   if(!this.data.length) return;
    //   var bank = !this.bank ? this.banks[this.types[0]][0] : this.bank;
    //   var data = _.orderBy(_.filter(this.data, {'bank': bank}), 'date', ['asc']);
    //   this.bank = bank;
    //   return _.reduce(data, (result, item) => {
    //     (result || (result = [])).push([item.date, item.deposits])
    //     return result;
    //   }, [])
    // }
  },
  created () {
    var exclude = [ 'Private Sector Banks', 'Public Sector Banks', 'Major Private Banks Sub Total', 'Regional Rural Banks', 'Regional Rural Banks Sub Total', 'Public Sector Banks', 'Public Sector Banks Sub Total', 'Private Sector Banks', 'Private Sector Banks Sub Total', 'Grand Total'];
    var header = this.raw.shift();
    var data = this.data

    Papa.parse('rhn19-pmjdy/cleaned_datasets/combined_cleaned_data.csv', {
      download: true,
      complete (data) {
        data.data.shift();
        var sample = _.sampleSize(data.data, data.data.length - 3);
        app.raw = sample;

        app.data = _.reduce(sample, (result, item, key) => {
          if(!_.includes(exclude, item[0])) {
            result.push({
              bank: item[0],
              rural: item[1],
              urban: item[2],
              total: item[3],
              deposits: item[4],
              cards_issued: item[5],
              level: item[6],
              date: item[7]
            })
          }
          return result
        }, [])
      }
    })
  }

})
