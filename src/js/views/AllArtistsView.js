var React = require('react-native');
var {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  RecyclerViewBackedScrollView,
  ListView,
} = React;
var DB = require('../data/DB');
var rethrowOr = require('../utils/rethrowOr');

var database = DB.getMusicDB();

var AllArtistsView = React.createClass({
  render: function () {
    return (
      <View style={styles.wrapper}>
        <ListView
          dataSource={this.state.dataSource}
          renderRow={this._renderArtist}
          renderScrollComponent={
            props => <RecyclerViewBackedScrollView {...props} />
          }
        />
      </View>
    );
  },

  getInitialState: function () {
    var dataSource = new ListView.DataSource(
      {rowHasChanged: (r1, r2) => r1.name !== r2.name }
    );
    return { 
      dataSource,
      manualQuery: '',
    };
  },

  componentDidMount: function () {
    var artists = [];
    database.executeSQL(
      `
      SELECT
        Artist.ArtistId, 
        Artist.Name, 
        count(DISTINCT Album.AlbumId) as AlbumCount, 
        count(DISTINCT Track.TrackId) as TrackCount 
      FROM Artist
      JOIN Album ON Album.ArtistId = Artist.ArtistId
      JOIN Track ON Track.AlbumId = Album.AlbumId
      GROUP BY Artist.ArtistId
      ORDER BY Artist.Name
      `,
      [],
      (row) => {
        console.log('the row', row);
        artists.push(row);
      },
      rethrowOr(() => this.setState({dataSource: this.state.dataSource.cloneWithRows(artists)})),
    );
  },

  _renderArtist: function (artist) {
    return (
      <TouchableHighlight onPress={() => this._selectArtist(artist)}>
        <View>
          <View style={styles.listItem}>
            <Text style={styles.listItemTitle}>{artist.Name}</Text>
            <Text style={styles.listItemSubtitle}>{artist.AlbumCount} albums, {artist.TrackCount} songs</Text>
          </View>
          <View style={styles.seperator}/>
        </View>
      </TouchableHighlight>
    );
  },

  _selectArtist: function (artist) {
    this.props.navigator.push(
      Routes.getRouteWithParams(
        Routes.ARTIST,
        {artistID: artist.ArtistId}
      ),
    );
  }
});

var styles = StyleSheet.create({
  listItemSubtitle: {
    fontStyle: 'italic',
    fontSize: 10
  },
  listItem: {
    padding: 10
  },
  wrapper: {
    backgroundColor: '#F8F9E7',
    flex: 1,
    justifyContent: 'center',
  },
});

module.exports = AllArtistsView;
