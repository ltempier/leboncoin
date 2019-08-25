
const mymap = L.map('map', { attributionControl: false }).setView([46.2, 4.1], 6);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
   maxZoom: 18,
   attribution: '',
   id: 'mapbox.streets'
}).addTo(mymap);



let mapLayers = [
   { name: "< 2 ha", min: 0 },
   { name: "> 2 ha", min: 20000 },
   { name: "> 5 ha", min: 50000 },
   { name: "> 10 ha", min: 100000 }
].sort((c) => c.min)

let mapControl = {};
mapLayers.forEach(function (layer, idx) {
   let nextLayer = mapLayers[idx + 1];
   if (nextLayer)
      layer.max = nextLayer.min

   layer.layerGroup = L.layerGroup().addTo(mymap);
   mapControl[layer.name] = layer.layerGroup
})

// let markersLayer = L.layerGroup().addTo(mymap);
L.control.layers(null, mapControl).addTo(mymap);

let markers = {};
let markersVoted = store.get('markersVoted') || {}

let offset = 0;
function fetchMore(reset) {

   $("#more-ads")
      .text('loading ...')
      .prop("disabled", true)

   if (reset) {
      markers = {}
      offset = 0
   }

   var query = {
      offset: offset,
      priceMax: 60000,
      priceMin: 1000
   }

   var urlParams = new URLSearchParams(location.search);
   ['priceMax', 'priceMin', 'areaMin'].forEach(function (paramName) {
      if (urlParams.has(paramName))
         query[paramName] = urlParams.get(paramName)
   })


   fetch("/ads?" + Object.keys(query).map(function (key) {
      return [key, query[key]].join('=')
   }).join("&"))
      .then((response) => {
         return new Promise((resolve, reject) => {
            if (response.ok)
               response.json().then(resolve).catch(reject);
            else
               response.text().then(function (text) {
                  reject(new Error(text));
               });
         })
      })
      .then(function (ads) {

         console.log("ads", ads)

         offset += ads.length
         ads.forEach(ad => {
            if (markers[ad.list_id])
               return

            ad.publicationDate = moment(ad.first_publication_date, 'YYYY-MM-DD HH:mm:ss')
            ad.deltaDateDays = moment().diff(ad.publicationDate, "days")
            ad.square = ad.attributes.find((attribute) => attribute.key === "square")

            if (ad.deltaDateDays > 300)
               return
            // console.log(ad.deltaDateDays)

            let markerValue = 0;
            let opacity = 1;

            // console.log(markersVoted[ad.list_id])

            switch (true) {
               case (markersVoted[ad.list_id] > 0):
                  markerValue = markersVoted[ad.list_id]
                  break;

               case (ad.deltaDateDays < 1):
                  markerValue = 4
                  break;

               case (ad.deltaDateDays < 7):
                  markerValue = 5
                  // opacity = (10 - ad.deltaDateDays) / 10
                  break;

               case (ad.deltaDateDays > 100):
                  opacity = 0.2
                  break;
               case (ad.deltaDateDays > 60):
                  opacity = 0.4
                  break;
               case (ad.deltaDateDays > 30):
                  opacity = 0.6
                  break;
               case (ad.deltaDateDays > 21):
                  opacity = 0.8
                  break;
            }


            const adLayer = mapLayers.find((layer) => {
               const squareValue = parseInt(ad.square.value)
               if (layer.min && layer.max)
                  return squareValue >= layer.min && squareValue < layer.max
               else if (layer.min)
                  return squareValue >= layer.min
               else if (layer.max)
                  return squareValue < layer.max
            })


            const marker = L.marker([ad.location.lat, ad.location.lng])
               .setIcon(getMarkerIcon(markerValue))
               .bindPopup(htmlPopup(ad))
               .setOpacity(opacity)
               .addTo(adLayer.layerGroup);

            markers[ad.list_id] = marker

            $("#more-ads").text('plus resultats')
            if (ads.length > 0)
               $("#more-ads").prop("disabled", false)
         });
      }).catch(function (error) {
         console.log('error', error);
         toastr.error(error.message, { timeOut: 5000 })
         $("#more-ads").text('plus resultats').prop("disabled", false)
      })
}

fetchMore();

function htmlPopup(ad) {

   return `
        <div class='map-popup'>
                <p><b>date:</b> ${ad.publicationDate.format('DD/MM/YYYY HH:mm:ss')} (${ad.deltaDateDays} Jours)</p>
                <p><b>surface:</b> ${ad.square.value_label}</p>
                <p><b>prix:</b> ${ad.price[0]} €</p>

                <a href=${ad.url} target="_blank">${ad.url}</a>

                <div class='btn-popup'>
                        <div class='btn-group'>
                                <button type="button" class="btn btn-success" onclick="vote(${ad.list_id},1)">bien</button>
                                <button type="button" class="btn btn-danger" onclick="vote(${ad.list_id},2)">nul</button>
                                <button type="button" class="btn btn-warning" onclick="vote(${ad.list_id},3)">gold</button>
                        </div>
                </div>

                <div class='img-popup'>
                ${(ad.images.urls_thumb || []).map(img => `<img src='${img}'/>`)}
                </div>
        </div>`
}


function vote(id, value) {

   // fetch('/infos/' + id, {
   //    method: 'post',
   //    note: value
   // })
   //    .then((response) => response.json())
   //    .then(info => {
   //       console.log(info)
   //       markers[id].setIcon(getMarkerIcon(info.note))
   //    })
   //    .catch(e => console.error(e))

   if (markersVoted[id] && markersVoted[id] === value) {
      value = 0
      delete markersVoted[id]
   }
   else
      markersVoted[id] = value
   markers[id].setIcon(getMarkerIcon(value))

   store.set('markersVoted', markersVoted);
}

// function fetchInfos() {
//    fetch('/infos')
//       .then((response) => response.json())
//       .then(infos => {
//          console.log(infos)
//          markers[id].setIcon(getMarkerIcon(info.note))
//       })
//       .catch(e => console.error(e))
// }

function getMarkerIcon(value) {
   switch (value) {
      case 1:
         return greenIcon
         break;
      case 2:
         return redIcon
         break;
      case 3:
         return orangeIcon
         break;
      case 4:
         return blackIcon
         break;
      case 5:
         return greyIcon
         break;
      case 6:
         return blueIconLowOpacity
         break;
      default:
         return blueIcon
         break
   }
}


