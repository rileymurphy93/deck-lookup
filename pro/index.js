$(document).ready(function () {
  const container = $('#container');
  const input = $('#textbox');
  const button = $('#submit');
  const output = $('#output');
  const timeStamp = $('#timestamp');




  button.click(function myFunc() {
    const myCards = [];
    const playerid = input.val();
    const time = timeStamp.val();
    const matches = [];
    let wonRecords;
    let lostRecords;
    let username;

    $.get(`https://api.godsunchained.com/v0/properties?user_id=${playerid}`, (d) => {
      const dat = JSON.parse(d);

      const recs = dat.records;
      const user = recs[0];

      username = user.username;

      $.get(`https://api.godsunchained.com/v0/match?start_time=${time}-&player_won=${playerid}`, (data) => {
        const obj = JSON.parse(data);
        wonRecords = obj.records && obj.records.filter((x) => x.game_mode === 6) || null;
        matches.push(wonRecords);
        $.get(`https://api.godsunchained.com/v0/match?start_time=${time}-&player_lost=${playerid}`, (data) => {
          const obj = JSON.parse(data);
          lostRecords = obj.records && obj.records.filter((x) => x.game_mode === 6) || null;
          matches.push(lostRecords);

          const flattened = matches.flat()
          const filtered = flattened.filter((x) => x !== null);

          output.append(`<p>${username}</p>`)
          output.append(`<p>Total Matches: ${filtered.length}</p>`);
          output.append(`<p>Won Matches: ${wonRecords && wonRecords.length || 0}</p>`);
          output.append(`<p>Lost Matches: ${lostRecords && lostRecords.length || 0}</p>`);


          filtered.map((x) => {
            output.append(`
              <div id='${x.game_id}-container'>
                <button class='action-button' id=${x.game_id}>See Match Details of match ${x.game_id.substring(0, 4)}</button>
              </div>
            `)
          });

          $('.action-button').click((e) => {
            const id = e.target.id;
            const targetMatchArr = filtered.filter(x => x.game_id === id);
            const targetMatch = targetMatchArr[0];
            const { player_won, player_info } = targetMatch;
            const outcome = parseInt(player_won) === parseInt(playerid) ? 'Won' : 'Lost';

            const userInfo = player_info.filter((x) => x.user_id === parseInt(playerid));
            const opponentInfo = player_info.filter((x) => x.user_id !== parseInt(playerid));

            const { cards: userCards } = userInfo[0];
            const { cards: opponentCards } = opponentInfo[0];

            console.log(userCards);
            console.log(opponentCards)

            $(`#${id}-container`).append(`<p>Outcome: ${username} ${outcome}</p>`);

            $(`#${id}-container`).append(`<button id='${id}-${playerid}-deck'>Show ${username} deck</button>`);
            $(`#${id}-container`).append(`<button id='${id}-opponent-deck'>Show opponent deck</button>`);

            const showCards = (cards, id) => {
              console.log(cards);
              const myCards = [];
              $.get("https://api.godsunchained.com/v0/proto?perPage=3000", function (data) {
                const cardData = JSON.parse(data);
                const allCards = cardData.records;
                cards.map((x) => {
                  const card = allCards.filter((y) => y.id === parseInt(x));
                  const targetcard = card[0];
                  const cardId = targetcard.id;
                  const result = {
                    ...targetcard,
                    image: `https://card.godsunchained.com/?id=${cardId}&q=4`
                  }
                  myCards.push(result);
                });
                const sorted = myCards.sort((a, b) => {
                  return a.mana - b.mana;
                });

                console.log(sorted);
                sorted.map((x) => {
                  $(`#${id}-container`).append(`<img src=${x.image}/>`)
                });
              });
            }

            $(`#${id}-${playerid}-deck`).click(() => {
              showCards(userCards, id);
            });
            $(`#${id}-opponent-deck`).click(() => {
              showCards(opponentCards, id);
            })

          });

        });
      });
    })








  });
});
