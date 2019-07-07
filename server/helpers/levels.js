//Next level's exp
function expCalc(level) {
  return Math.round((4 * level ** 3) / 5);
}

//->More exp needed to reach next level
function expToNextLevel(level, exp) {
  return expCalc(level + 1) - exp;
}

module.exports.expToNextLevel = expToNextLevel;
module.exports.expCalc = expCalc;
