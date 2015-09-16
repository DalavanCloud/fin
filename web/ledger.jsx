// Copyright 2015 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

require('./ledger.scss');
var Page = require('./page');
var util = require('./util');
var filter = require('./filter');
var AutoComplete = require('./autocomplete');
var Graph = require('./graph');

var Ledger = React.createClass({
  getInitialState() {
    return {sel:null};
  },

  render: function() {
    var entries = this.props.entries;

    // Make a row for total.
    var total = {
      date:'',
      payee:'Total of ' + entries.length + ' entries',
      amount:0
    };
    entries.forEach((e) => total.amount += e.amount);

    entries = entries.slice(0, 200);
    entries.unshift(total);

    var last = null;
    var rEntries = entries.map((e, i) => {
      var date = e.date.slice(0, 7);
      var next = date;
      if (last != null) {
        if (last == date) {
          date = '';
        }
      }
      last = next;

      var tags = null;
      if (e.tags) {
        tags = e.tags.map((t) => ' #' + t);
        tags = <span>{tags}</span>;
      }
      var sel = this.state.sel != null && i == this.state.sel;
      var className = 'ledger-entry';
      if (sel)
        className += ' sel';
      return (
        <div className={className} key={i} onClick={this.onSel.bind(this, i)}>
          <div className="ledger-date">{date}</div>
          <div className="ledger-body" title={e.date}>
            <div className="ledger-payee">{e.payee}</div>
            {sel ? <div>
             tag: <AutoComplete options={this.props.tags}
             onCommit={this.onTag.bind(this, i == 0 ? entries : [e])}
             initialText={(e.tags || []).join(' ')} />
             </div> :
             <div className="ledger-tags">{tags}</div>}
          </div>
          <div className="ledger-money">{util.formatAmount(e.amount)}</div>
        </div>
      );
    });
    return (
      <div className="ledger">{rEntries}</div>
    );
  },

  onSel(i) {
    this.setState({sel: i});
  },

  onTag(entries, tags) {
    this.props.onTag(entries, tags);
  },
});
exports.Ledger = Ledger;

exports.LedgerPage = React.createClass({
  getInitialState() {
    var params = util.parseURLParams(document.location.search);
    var filters = filter.filterStateFromURL(params);
    return {filters};
  },

  getEntries() {
    var entries = this.props.entries;
    var query = filter.filtersToQuery(this.state.filters);
    var f = filter.parseQuery(query);
    if (f) {
      entries = this.props.entries.filter(f);
    }
    return entries;
  },
  
  render() {
    var entries = this.getEntries();

    var total = 0;
    entries.forEach((e) => total += e.amount);

    // Use this.props.entries (not entries) here so that we see all
    // tags in the autocomplete.
    var allTags = Object.keys(util.gatherTags(this.props.entries));

    var applyTag = null;
    if (this.state.filters.query) {
      applyTag = (
        <span>
          Tag: <AutoComplete options={allTags}
                             onCommit={(t) => this.onTag(entries, t)} />
        </span>
      );
    }

    return (
      <div>
        <header>
          <h1 className="title">fin</h1>
          <div className="spacer"></div>
          <div>
            <filter.FilterPane entries={entries} filters={this.state.filters}
                               onFilters={this.onFilters} />
          </div>
        </header>
        <div className="body">
          <main>
            <Graph entries={entries} />
            <Ledger entries={entries} tags={allTags} onTag={this.onTag} />
          </main>
        </div>
      </div>
    );
  },

  onTag(entries, text) {
    var json = {
      tags: text.split(/\s+/).filter((t) => /\w/.test(t)),
      ids: entries.map((e) => e.id),
    };

    req = new XMLHttpRequest();
    req.onload = () => window.location.reload();
    req.open('post', '/');
    req.send(JSON.stringify(json))

    return false;
  },

  onFilters(filters) {
    var search = filter.filterStateToURL(filters);
    this.setState({filters: filters});
    history.replaceState({}, null,
                         util.urlWithQuery(location.href,
                                           filter.filterStateToURL(filters)));
  },
});
