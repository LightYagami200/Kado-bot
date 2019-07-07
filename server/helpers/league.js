module.exports.getLeagueName = leagueNumber => {
  switch (leagueNumber) {
    case 0:
      return 'Unranked';
    case 1:
      return 'Copper League';
    case 2:
      return 'Iron League';
    case 3:
      return 'Bronze League';
    case 4:
      return 'Silver League';
    case 5:
      return 'Gold League';
    case 6:
      return 'Dark Gold League';
    case 7:
      return 'Platinum League';
    case 8:
      return 'Diamond League';
    case 9:
      return 'Supreme League';
    case 10:
      return 'Legend';
  }
};
