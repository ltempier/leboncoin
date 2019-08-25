
var body = {
   limit: 100,
   filters: {
      category: { id: "9" },
      enums: {
         ad_type: ["offer"],
         real_estate_type: ["3"]
      },
      ranges: {
         "square": { "min": 20000 },
         "price": { "min": 1000, "max": 70000 }
      }
   },
   sort_by: "time",
   sort_order: "desc"
};

console.log('io')
$("#fecth-btn").on('click', function () {

   var $results = $("#results")

   fetch('https://api.leboncoin.fr/finder/search', {
      "method": "POST",
      "body": JSON.stringify(body, null),
      "credentials": "include",
   })
      // .then(response => response.json())
      .then(function (response) {
         $results.text('response: ' + JSON.stringify(response, null))
      }).catch(function (error) {
         $results.text('error: ' + error.message)
      })
})