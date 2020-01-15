//check for API info in console -> don't use for anything else
const apiKey = 'cHWA0cyVrIeIZHFmZyrlp3UBNFO1aqLn7LsYLij2';
/*senate api*/
const senate = fetch("https://api.propublica.org/congress/v1/116/senate/members.json", { headers: { "X-Api-Key": apiKey } })
  .then((response) => {
    return response.json()
  })
  .then(data => {
    console.log(data)
  });
/*house api*/
const house = fetch("https://api.propublica.org/congress/v1/116/house/members.json", { headers: { "X-Api-Key": apiKey } })
  .then((response) => {
    return response.json()
  })
  .then(data => {
    console.log(data)
  });