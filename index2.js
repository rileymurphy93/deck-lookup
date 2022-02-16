$( document ).ready(function() {
    const container = $('#container');
    const input = $('#textbox');
    const button = $('#submit');
    const output = $('#output');
    button.click(function myFunc(){
      const myCards = [];
      const value = input.val();
      const cardIds = value.split(',').map(function (x) {
        return x.trim();
      });
      $.get( "https://api.godsunchained.com/v0/proto?perPage=3000", function( data ) {
        const cardData = JSON.parse(data);
        const allCards = cardData.records;
        cardIds.map((x) => {
          const card = allCards.filter((y) => y.id === parseInt(x));
          const targetcard = card[0];
          const id = targetcard.id;
          const result = {
            ...targetcard,
            image:`https://card.godsunchained.com/?id=${id}&q=4`
          }
          console.log(id);

          myCards.push(result);
        });
          const sorted = myCards.sort((a, b) => {
            return a.mana - b.mana;
          })
          sorted.map((x) => {
            output.append(`<img src=${x.image}/>`)
          });
      });
    });
});
