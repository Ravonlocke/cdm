function ScriptLoader(url, callback){
    var script = document.createElement("script");
    script.type = "text/javascript";
    if (script.readyState){ //IE
        script.onreadystatechange = function() {
            if (script.readyState == "complete") {
                script.onreadystatechange = null;
                callback();
            }
        };
    } else { //Others
        script.onload = function(){
            callback();
        };
    }
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
}

document.addEventListener('cdm-custom-page:ready', function(event) {
    if (event.detail.filename.endsWith('timeline')) {
        /*
        * Main execution
        */
       ScriptLoader('https://cdn.jsdelivr.net/npm/url-polyfill@1.0.13/url-polyfill.min.js', function() {
          ScriptLoader('https://cdnjs.cloudflare.com/ajax/libs/axios/0.18.0/axios.min.js', function() {
            ScriptLoader('https://cdn.knightlab.com/libs/timeline3/latest/js/timeline.js', function(){
                ScriptLoader('https://cdm17085.contentdm.oclc.org/customizations/global/pages/iiif-tools.js', function(){
                    let cssFileRef = document.createElement("link");
                    cssFileRef.rel = "stylesheet";
                    cssFileRef.type = "text/css";
                    cssFileRef.href = "https://cdn.knightlab.com/libs/timeline3/latest/css/timeline.css";
                    document.getElementsByTagName("head")[0].appendChild(cssFileRef)
                    
                    axios.get('https://cdm17085.contentdm.oclc.org/digital/bl/dmwebservices/index.php?q=dmQuery/p17085coll1/0/title/title/100/1/0/0/0/0/json')
                    .then(function(response) {
                        let collectionManifest = createCollectionManifest();
                        response.data.records.forEach(function(record) {
                            collectionManifest.members.push(createMember(record));
                        });

                        let promises = [];
                        collectionManifest.members.forEach(function(collectionManifestMember) {
                            promises.push(axios.get(collectionManifestMember['@id']));
                        });

                        axios.all(promises).then(function(results){
                            let timelineJson = {
                                'title' : {'text': 'CONTENTdm IIIF Timeline Demo'},
                                'events' : []
                            };

                            results.forEach(function(response){
                                let eventData = convertToEvent(response.data);
                                timelineJson.events.push(eventData);
                            });
                            window.timeline = new TL.Timeline('timeline-embed', timelineJson);
                        });
                    }).catch(function(error) {
                        console.log(error);
                    });
                });
            });
          });
       });
    }
});
