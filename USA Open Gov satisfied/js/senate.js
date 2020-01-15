//API info on page
const app = new Vue({
  el: "#app-1",
  data: {
    url: "https://api.propublica.org/congress/v1/116/senate/members.json",
    apiKey: "cHWA0cyVrIeIZHFmZyrlp3UBNFO1aqLn7LsYLij2",
    items: [],
    currentSort: 'last_name',
    currentSortDir: 'asc',
    topSort: 'last_name',
    topSortDir: 'desc',
    bottomSort: 'last_name',
    bottomSortDir: 'asc',
    filters: [],
    topTen: [],
    bottomTen: [],
    state: 'none',
    name: '',
    repCount: 0,
    demCount: 0,
    indCount: 0,
    repVotesPct: 0,
    demVotesPct: 0,
    indVotesPct: 0,
  },
  async mounted() {
    await fetch(this.url, {
      headers: {
        "X-Api-Key": this.apiKey
      }
    })
      .then(response => response.json())
      .then(people => {
        people.results[0].members.forEach((item) => {
          if (item.in_office) {
            item.seniority = Number(item.seniority); // change string into number
            this.items.push(item);
          }
        });
      })
    this.getVotes(); //calls getVotes
    this.getUpperAndLower('missed_votes_pct'); //calls getUpperAndLower for missed votes pct
    this.getUpperAndLower('votes_with_party_pct'); //calls getUpperAndLower for votes with party pct
  },
  methods: {
    sort: function (s) { // sorts A-Z Z-A (general sorter)
      if (s === this.currentSort) {
        this.currentSortDir = this.currentSortDir === 'asc' ? 'desc' : 'asc';
      }
      this.currentSort = s;
    },
    sortTop: function (s) { // sorts A-Z Z-A (made so it doesn't clash with other sorts)
      if (s === this.topSort) {
        this.topSortDir = this.topSortDir === 'desc' ? 'asc' : 'desc';
      }
      this.topSort = s;
    },
    sortBottom: function (s) { // sorts A-Z Z-A (made so it doesn't clash with other sorts)
      if (s === this.bottomSort) {
        this.bottomSortDir = this.bottomSortDir === 'asc' ? 'desc' : 'asc';
      }
      this.bottomSort = s;
    },
    filter: function (column, value) { //gets called in HTML for party filter
      let contains = false;
      for (filterIdx in this.filters) {
        let filter = this.filters[filterIdx];
        if (filter.col == column && filter.val == value) {
          contains = true;
          this.filters.splice(filterIdx, 1);
          break; // breaks out of loop when matches been found
        }
      }
      if (!contains) {
        this.filters.push({
          col: column,
          val: value
        });
      }
    },
    setState: function (event) { //gets called in HTML for state filter
      this.state = event.target.value;
    },
    searchName: function (event) { //gets called in HTML for searchbar
      this.name = event.target.value.toLowerCase();
    },
    getVotes: function () { //sorts num of rep/dem/ind and average value of party votes, gets called in HTML
      let repTotal = 0;
      let demTotal = 0;
      let indTotal = 0;
      for (let i = 0; i < this.items.length; i++) {
        if (this.items[i].party === 'R') { // per party
          this.repCount++;
          repTotal += this.items[i].votes_with_party_pct; // total amount of 'R' = starting amount of 'R' (0) + party_votes_pct till all 'R' have been looped through
        } else if (this.items[i].party === 'D') {
          this.demCount++;
          demTotal += this.items[i].votes_with_party_pct;
        } else if (this.items[i].party === 'ID') {
          this.indCount++
          indTotal += this.items[i].votes_with_party_pct;
        }
      }
      this.repVotesPct = (repTotal / this.repCount).toFixed(2); //divides accumulated party votes by the amount of members of 'R'
      this.demVotesPct = (demTotal / this.demCount).toFixed(2);
      this.indVotesPct = (indTotal / this.indCount).toFixed(2);
    },
    getUpperAndLower: function (column) { //top/bottom 10%
      let count = Math.floor(this.items.length * 0.1); //gets the 10%
      this.topTen[column] = this.items.sort((a, b) => { //top 10%
        let aVal = a[column];
        let bVal = b[column];
        if (aVal > bVal) return 1;
        if (aVal < bVal) return -1;
        return 0;
      }).slice(0, count); //removes excess
      this.bottomTen[column] = this.items.sort((a, b) => { //bottom 10%
        let aVal = a[column];
        let bVal = b[column];
        if (aVal > bVal) return -1;
        if (aVal < bVal) return 1;
        return 0;
      }).slice(0, count); //removes excess
    },
    totalVotes: function (item) { // calculates total party votes, gets called in the table. 
      return Math.round(item.total_votes * (item.votes_with_party_pct / 100));
    }
  },
  computed: {
    sortedItems: function () {
      return this.items.filter((item) => {
        if (this.state != "none" && item['state'] != this.state) // filter state
          return false;
        if (this.name != "" && !(item['first_name'].toLowerCase().includes(this.name) || item['last_name'].toLowerCase().includes(this.name))) //filter searchbar
          return false;
        if (this.filters.length == 0)
          return true;
        for (filterIdx in this.filters) { // filter checkbox
          let filter = this.filters[filterIdx];
          if (item[filter.col] == filter.val) {
            return true
          }
        }
        return false;
      }).sort((a, b) => { //sort A-Z Z-A
        let modifier = 1;
        if (this.currentSortDir === 'desc') modifier = -1;
        if (a[this.currentSort] < b[this.currentSort]) return -1 * modifier;
        if (a[this.currentSort] > b[this.currentSort]) return 1 * modifier;
        return 0;
      });
    },
    topTenSorted: (app) => (column) => {
      if (app.topTen[column] === undefined) return []; //counters pre-page load mistakes, if undefined return array
      return app.topTen[column].sort((a, b) => { //adds a sort for top table
        let modifier = 1;
        if (app.topSortDir === 'desc') modifier = -1;
        if (a[app.topSort] < b[app.topSort]) return -1 * modifier;
        if (a[app.topSort] > b[app.topSort]) return 1 * modifier;
        return 0;
      });
    },
    bottomTenSorted: (app) => (column) => { //adds a sort for bottom table
      if (app.bottomTen[column] === undefined) return []; //counters pre-page load mistakes, if undefined return array
      return app.bottomTen[column].sort((a, b) => {
        let modifier = 1;
        if (app.bottomSortDir === 'asc') modifier = -1;
        if (a[app.bottomSort] < b[app.bottomSort]) return -1 * modifier;
        if (a[app.bottomSort] > b[app.bottomSort]) return 1 * modifier;
        return 0;
      });
    }
  }
})