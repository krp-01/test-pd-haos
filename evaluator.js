
blockExportShortcuts();

let currentData = null;

const labels = {
  confirm_read_rules:"A citit regulamentul",
  confirm_ic_ooc:"Înțelege IC/OOC",
  confirm_no_abuse:"Nu aplică pentru abuz",
  confirm_truth:"Confirmă sinceritatea",
  confirm_staff:"Acceptă decizia testerilor",
  final_confirm:"Confirmare finală",
  ooc_name:"Nume OOC",
  game_id:"ID in-game",
  real_age:"Vârstă reală",
  occupation:"Ocupație",
  server_hours:"Ore pe server",
  microphone:"Microfon",
  sanctions:"Sancțiuni",
  activity_time:"Activitate zilnică",
  why_pd:"Motivație PD",
  ic_name:"Nume IC",
  ic_age:"Vârstă IC",
  city_experience:"Vechime în oraș",
  ic_education:"Studii IC",
  previous_jobs:"Joburi anterioare",
  ic_description:"Descriere IC",
  ic_fit:"De ce e potrivit",
  ic_qualities:"Calități IC"
};

const quizKeys = {q1:"B", q2:"B", q3:"A", q4:"B", q5:"A", q6:"B", q7:"B", q8:"B", q9:"B", q10:"B", q11:"B", q12:"A", q13:"B", q14:"B", q15:"B"};

const behaviorLabels = {
  behavior_1:"Un suspect te insultă IC în timpul unei opriri. Ce faci?",
  behavior_2:"Un prieten îți cere să îl lași fără amendă sau să îi dai informații din PD. Ce faci?",
  behavior_3:"Un coleg PD face abuz de funcție. Ce faci?",
  behavior_4:"Pierzi o urmărire și ceilalți râd de tine. Cum reacționezi?",
  behavior_5:"De ce crezi că un polițist slab poate strica RP-ul pe server?"
};

const situationLabels = {
  situation_1:"Oprire complexă în trafic",
  situation_2:"Urmărire cu risc",
  situation_3:"Prieten implicat",
  situation_4:"Conflict cu o mafie",
  situation_5:"Coleg abuziv",
  situation_6:"Scenă medicală",
  situation_7:"Ordin discutabil",
  situation_8:"Ticket pe tine",
  situation_9:"Radio haotic",
  situation_10:"Decizie morală"
};

const decipherLabels = {
  decipher_1:"Raport cronologic",
  decipher_2:"Logică intervenție",
  decipher_3:"Raport neutru",
  decipher_4:"Escaladare proporțională",
  decipher_5:"Ordine martori/vehicule",
  decipher_6:"Control OOC",
  decipher_7:"Meta gaming / justificare IC",
  decipher_8:"Principiu de escaladare PD"
};

function esc(s){
  return String(s ?? "").replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}

function boolText(v){ return v ? "Da" : "Nu"; }

function render(dataPack){
  currentData = dataPack;
  const d = dataPack.data || {};
  document.getElementById("loadStatus").className = "note success-note";
  document.getElementById("loadStatus").textContent = "Test încărcat. Trimis la: " + (dataPack.submittedAt || "necunoscut");
  document.getElementById("rawBox").textContent = JSON.stringify(dataPack, null, 2);

  const mainKeys = ["ooc_name","game_id","real_age","occupation","server_hours","microphone","activity_time","ic_name","ic_age","city_experience"];
  document.getElementById("summaryBox").innerHTML = mainKeys.map(k => `<div class="kv"><b>${labels[k] || k}</b><span>${esc(d[k] || "-")}</span></div>`).join("");

  let html = "";
  html += "<h3>Confirmări</h3>";
  ["confirm_read_rules","confirm_ic_ooc","confirm_no_abuse","confirm_truth","confirm_staff","final_confirm"].forEach(k => {
    html += `<div class="kv"><b>${labels[k]}</b><span>${boolText(d[k])}</span></div>`;
  });

  html += "<h3>Date OOC / IC</h3>";
  ["sanctions","why_pd","previous_jobs","ic_description","ic_fit","ic_qualities"].forEach(k => {
    html += `<div class="question-card"><strong>${labels[k] || k}</strong><div class="response-box">${esc(d[k] || "-")}</div></div>`;
  });

  html += "<h3>Scoruri comportamentale 1-5</h3><table><thead><tr><th>#</th><th class='center'>Răspuns</th></tr></thead><tbody>";
  for(let i=1;i<=10;i++) html += `<tr><td>Afirmația ${i}</td><td class="center">${esc(d["l"+i] || "-")}</td></tr>`;
  html += "</tbody></table>";

  html += "<h3>Întrebări comportamentale</h3>";
  Object.entries(behaviorLabels).forEach(([k,label]) => {
    html += `<div class="question-card"><strong>${label}</strong><div class="response-box">${esc(d[k] || "-")}</div></div>`;
  });

  html += "<h3>Situații PD</h3>";
  Object.entries(situationLabels).forEach(([k,label]) => {
    html += `<div class="question-card"><strong>${label}</strong><div class="response-box">${esc(d[k] || "-")}</div></div>`;
  });

  html += "<h3>Descifrare rapidă</h3>";
  Object.entries(decipherLabels).forEach(([k,label]) => {
    html += `<div class="question-card"><strong>${label}</strong><div class="response-box">${esc(d[k] || "-")}</div></div>`;
  });

  document.getElementById("answersBox").innerHTML = html;
  renderQuiz(d);
}

function renderQuiz(d){
  let correct = 0;
  let rows = "";
  Object.entries(quizKeys).forEach(([k,answer], idx) => {
    const candidate = d[k] || "-";
    const ok = candidate === answer;
    if(ok) correct++;
    rows += `<tr><td>${idx+1}</td><td class="center">${answer}</td><td class="center">${esc(candidate)}</td><td class="center ${ok ? "correct" : "wrong"}">${ok ? "Corect" : "Greșit"}</td></tr>`;
  });
  document.getElementById("quizCheckRows").innerHTML = rows;
  const score = Math.round((correct / Object.keys(quizKeys).length) * 20);
  document.getElementById("rulesScore").value = score;
  updateScore();
}

function loadPayloadString(str){
  try {
    const obj = decodePayload(str);
    render(obj);
  } catch(e) {
    document.getElementById("loadStatus").className = "note danger";
    document.getElementById("loadStatus").textContent = "Nu am putut citi linkul/codul. Verifică dacă a fost copiat complet.";
  }
}

function loadFromHash(){
  if(location.hash.includes("r=")) loadPayloadString(location.hash.split("r=")[1]);
  else document.getElementById("loadStatus").textContent = "Nu există date în link. Lipește manual codul/linkul primit.";
}

function loadManual(){
  const v = document.getElementById("manualPayload").value.trim();
  if(!v) return alert("Lipește linkul sau codul.");
  loadPayloadString(v);
}

function toggleRaw(){
  document.getElementById("rawBox").classList.toggle("hidden");
}

function updateScore(){
  let total = 0;
  document.querySelectorAll(".score").forEach(input => {
    const max = Number(input.dataset.max || input.max || 100);
    let val = Number(input.value || 0);
    val = Math.min(Math.max(val,0),max);
    if(input.value !== "" && Number(input.value) !== val) input.value = val;
    total += val;
  });
  document.getElementById("totalScore").textContent = total;
  document.getElementById("totalTable").textContent = total;
}

document.querySelectorAll(".score").forEach(i => i.addEventListener("input", updateScore));

function saveEvaluation(){
  const evaluation = {
    savedAt:new Date().toISOString(),
    candidate: currentData,
    score:Array.from(document.querySelectorAll(".score")).map(i => i.value),
    decision:document.getElementById("decisionSelect").value,
    finalNotes:document.getElementById("finalNotes").value,
    liveNotes:document.getElementById("liveNotes").value
  };
  localStorage.setItem("pd_haos_last_evaluation", JSON.stringify(evaluation));
  alert("Evaluarea a fost salvată local în browserul evaluatorului.");
}

loadFromHash();
