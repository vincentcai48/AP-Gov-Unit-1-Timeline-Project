// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
  apiKey: "AIzaSyDGdewN1ddOwh6HX1TOMJir0OjWIQm8_5g",
  authDomain: "apgovunit1timelineproject.firebaseapp.com",
  databaseURL: "https://apgovunit1timelineproject.firebaseio.com",
  projectId: "apgovunit1timelineproject",
  storageBucket: "apgovunit1timelineproject.appspot.com",
  messagingSenderId: "2333288188",
  appId: "1:2333288188:web:db021095d4c8e876a6d979",
  measurementId: "G-ZB955LTS1M",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
var db = firebase.firestore();
var key = "";
var conclusionHtml = "";
var str = "";
var sourcesHtml = "";
var showValues = false; //show how much +/- each event is, scale of -5 to 5.

getSettings = () => {
  db.collection("settings")
    .doc("settings")
    .get()
    .then((doc) => {
      key = doc.data().key;
      document.querySelector(".vc-sites-logo").style.display = doc.data()[
        "displayVClogo"
      ]
        ? "block"
        : "none";
      showValues = doc.data()["showValues"];
      renderEvents();
    });
};

getSettings();

updateHtml = () => {
  document.getElementById("events-list").innerHTML =
    str + conclusionHtml + sourcesHtml;
};

renderEvents = () => {
  db.collection("events")
    .orderBy("date")
    .onSnapshot((docs) => {
      str = "";
      var total = 0;
      var min = 0;
      var max = Number.NEGATIVE_INFINITY;
      docs.forEach((doc) => {
        total += doc.data().federalismScore;
        if (total < min) min = total;
        if (total > max) max = total;
      });
      var range = max - min;

      var currentScore = min < 0 ? -min : 0;
      var percent = (currentScore / range) * 100;
      docs.forEach((doc) => {
        var docData = doc.data();
        currentScore += docData.federalismScore;
        percent = (currentScore / range) * 100;
        // console.log("Percent: ", percent);
        var className = "staysame";
        var plusminus = "";
        if (docData.federalismScore < 0) {
          className = "minus";
          plusminus = "-";
        } else if (docData.federalismScore > 0) {
          className = "plus";
          plusminus = "+";
        }
        plusminus += showValues ? Math.abs(docData.federalismScore) : "";

        str +=
          "<li class='single-event'><div class='event-left'><h4>" +
          docData.name +
          "<div class='federalism-effect " +
          className +
          "'>" +
          plusminus +
          //   Math.abs(docData.federalismScore) +
          "</div></h4><div class='displayDateEvent'>" +
          docData.displayDate +
          " - </div><p class='description-timeline'>" +
          docData.description +
          "</p></div><div class='event-right'><div class='bar-background'><div class='bar' style='left: " +
          percent +
          "%'</div></div></div></li>";
      });

      updateHtml();
    });
};

renderConclusion = () => {
  db.collection("settings")
    .doc("conclusion")
    .onSnapshot((doc) => {
      conclusionHtml =
        "<div id='conclusion'><h3>Conclusion</h3><div id='conclusion-body'>" +
        doc.data()["text"] +
        "</div></div>";
      updateHtml();
    });
};

renderSources = () => {
  db.collection("settings")
    .doc("sources")
    .onSnapshot((doc) => {
      sourcesHtml =
        "<div id='sources'><h3>Sources</h3><div id='sources-body'>" +
        doc.data()["text"].replaceAll("&&linebreak&&", "<br/>") +
        "</div></div>";
      updateHtml();
    });
};

renderSources();

renderConclusion();

renderEvents();

// Show/hide the add forms
document.getElementById("key-input").addEventListener("change", (e) => {
  console.log(e.target.value);
  if (e.target.value == key) {
    document.getElementById("add-event").style.display = "block";
    document.getElementById("random-text").style.display = "block";
    document.getElementById("edit-conclusion").style.display = "block";
  } else {
    document.getElementById("add-event").style.display = "none";
    document.getElementById("random-text").style.display = "none";
    document.getElementById("edit-conclusion").style.display = "none";
  }
});

db.collection("settings")
  .doc("conclusion")
  .get()
  .then((doc) => {
    document.getElementById("edit-conclusion-textarea").value = doc.data()[
      "text"
    ];
  });

db.collection("settings")
  .doc("sources")
  .get()
  .then((doc) => {
    document.getElementById("edit-sources-textarea").value = doc
      .data()
      ["text"].replaceAll("&&linebreak&&", "\n");
  });

document
  .getElementById("edit-conclusion-submit")
  .addEventListener("click", () => {
    var textUpdated = document.getElementById("edit-conclusion-textarea").value;
    console.log(textUpdated);
    db.collection("settings")
      .doc("conclusion")
      .update({ text: textUpdated })
      .then(() => {
        window.location = "/#conclusion";
      })
      .catch(() => {
        alert("Something Went Wrong. Please Try Again");
      });
  });

document.getElementById("edit-sources-submit").addEventListener("click", () => {
  var textUpdated = document
    .getElementById("edit-sources-textarea")
    .value.replaceAll("\n", "&&linebreak&&");
  console.log(textUpdated);
  db.collection("settings")
    .doc("sources")
    .update({ text: textUpdated })
    .then(() => {
      window.location = "/#sources";
    })
    .catch(() => {
      alert("Something Went Wrong. Please Try Again");
    });
});

document.getElementById("submit").addEventListener("click", () => {
  const name = document.getElementById("event-name").value;
  const description = document.getElementById("event-description").value;
  const federalismScore = document.getElementById("federalismScore").value;
  const date = document.getElementById("date").value;
  const displayDate = document.getElementById("displayDate").value;

  if (!name || !description || !federalismScore || !date || !displayDate)
    return alert("Every Field Needs to be filled");

  console.log(date, date.toString());

  db.collection("events")
    .doc(name)
    .set({
      name: name,
      description: description,
      federalismScore: Number(federalismScore),
      date: firebase.firestore.Timestamp.fromDate(new Date(date)),
      displayDate: displayDate,
    })
    .then(() => (window.location = "/#main-content"))
    .catch(() => console.log("error"));
});
