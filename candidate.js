
blockExportShortcuts();

function requiredWarnings(data){
  const warnings = [];
  if(!data.confirm_read_rules || !data.confirm_ic_ooc || !data.confirm_no_abuse || !data.confirm_truth || !data.confirm_staff) warnings.push("Nu ai bifat toate confirmările inițiale.");
  if(!data.ooc_name || !data.game_id || !data.real_age || !data.occupation || !data.server_hours) warnings.push("Nu ai completat toate datele OOC importante.");
  if(!data.ic_name || !data.ic_age) warnings.push("Nu ai completat datele IC de bază.");
  if(!data.final_confirm) warnings.push("Nu ai bifat confirmarea finală.");
  return warnings;
}

function generateEvaluatorLink(){
  const data = collectFormData();
  const warnings = requiredWarnings(data);
  if(warnings.length){
    const ok = confirm("Formularul pare incomplet:\n\n- " + warnings.join("\n- ") + "\n\nVrei să generezi totuși linkul?");
    if(!ok) return;
  }
  const payload = encodePayload({v:1, type:"pd-haos-application", submittedAt:new Date().toISOString(), data});
  const evaluatorUrl = new URL("evaluator.html", window.location.href);
  evaluatorUrl.hash = "r=" + payload;
  document.getElementById("result").classList.remove("hidden");
  document.getElementById("evaluatorLink").value = evaluatorUrl.toString();
  document.getElementById("result").scrollIntoView({behavior:"smooth", block:"center"});
}

function copyLink(){
  const box = document.getElementById("evaluatorLink");
  box.select();
  navigator.clipboard?.writeText(box.value).then(() => alert("Link copiat."), () => {
    document.execCommand("copy");
    alert("Link copiat.");
  });
}

function saveLocal(){
  localStorage.setItem("pd_haos_candidate_draft", JSON.stringify(collectFormData()));
  alert("Formular salvat temporar în acest browser.");
}

function loadLocal(){
  const raw = localStorage.getItem("pd_haos_candidate_draft");
  if(!raw) return alert("Nu există salvare temporară.");
  const data = JSON.parse(raw);
  document.querySelectorAll("input, textarea, select").forEach(el => {
    if(!el.name) return;
    if(el.type === "checkbox") el.checked = !!data[el.name];
    else if(el.type === "radio") el.checked = data[el.name] === el.value;
    else if(data[el.name] !== undefined) el.value = data[el.name];
  });
  alert("Salvarea a fost încărcată.");
}
