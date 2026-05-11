/*
id              /管理番号
title           /曲名
titleen         /曲名　（英語）
composer        /作曲者
arranger        /編曲者
links           /リンク集
 youtube        /YouTubeリンク
 publisher      /編集者リンク
tags            /タグ
instrumentation /編成
solo            /ソロ
trumpetRange    /トランペット最高音
grade           /グレード
original        /元曲
durationSeconds /演奏時間（秒）（１５秒単位）

notes           /補足情報
discussion      /議論
createdBy       /運営・作成者
updatedAt       /運営・更新日
updatedBy       /運営・更新者
status          /運営・状態
approvedBy      /承認者
*/
/*　タグの一覧
① 雰囲気
    明るい　楽しい　感動　壮大　幻想的　神秘的　かっこいい　激しい　悲しい　緊張感
② 世界観・テーマ
    和風　西洋風　中世　中国風　民族風　海　空　宇宙　自然　都市　戦い　冒険　祭り　物語　歴史　クリスマス
③ ジャンル・元ネタ
    オリジナル　映画　アニメ　ゲーム　J-pop　クラシック編曲　ジャズ
④ テンポ・動き
    遅い　中速　速い　変化あり
⑤ 用途
    コンクール　課題曲　定期演奏会　アンコール　アンサンブル
⑥ 特徴
    金管主体　木管主体　打楽器多い　ソロあり　技巧的
⑦ 音楽スタイル
    マーチ　ワルツ　ダンス　ファンファーレ　バラード　スウィング　ラテン
*/

window.onload = async () => {
  await loadSongs();
};
let songs=[];
async function loadSongs() {
    const res = await fetch("songs.json");
    songs = await res.json();  
}
function renderInstrumentation(inst) {
  let html = "";

  for (const key in inst) {

    // Percussion
    if (key === "Percussion") {
      html += "<p><strong>　　　　Percussion</strong></p>";

      const perc = inst[key];

      for (const part in perc) {
        if (Array.isArray(perc[part])) {
          html += `<p>　　　　　${part}: ${perc[part].join(", ")}</p>`;
        } else if (perc[part] > 0) {
          html += `<p>　　　　　${part}</p>`;
        }
      }
      continue;
    }

    // 単体楽器（ここがポイント）
    const { base, optional } = normalizeCount(inst[key]);

    if (base > 0 || optional > 0) {
      if (optional > 0) {
        html += `<p>　　　　　${key}: ${base} (+opt.${optional})</p>`;
      } else {
        html += `<p>　　　　　${key}: ${base}</p>`;
      }
    }
  }

  return html;
}
function formatValue(v) {
  if (v === null) return "なし";
  if (v === "Unknown") return "不明";
  if (v === "") return "（未入力）";
  return v;
}
function renderLinks(links) {
  let html = "";

  if (links.youtube) {
    const id = getYoutubeId(links.youtube);

    if (id) {
    html += `
    <div style="max-width: 360px; margin: 10px 0;">
    <div style="position:relative;padding-bottom:56.25%;height:0;">
        <iframe 
        src="https://www.youtube.com/embed/${id}"
        style="position:absolute;top:0;left:0;width:100%;height:100%;"
        frameborder="0"
        allowfullscreen>
        </iframe>
    </div>
    </div>
    `;
    }

    html += `<p>YouTube：<a href="${links.youtube}" target="_blank">${links.youtube}</a></p>`;
  }

  if (links.url) {
    html += `<p>出版社：<a href="${links.url}" target="_blank">${links.url}</a></p>`;
  }

  return html;
}
function renderSolo(solo) {
  if (!solo || solo.length === 0) return "<p><strong>ソロ：</strong>なし</p>";
  return `<p><strong>　　　ソロ：</strong>${solo.join(", ")}</p>`;
}
function normalizeCount(value) {
  if (Array.isArray(value)) {
    return {
      base: value[0] ?? 0,
      optional: value[1] ?? 0
    };
  }

  if (typeof value === "number") {
    return {
      base: value,
      optional: 0
    };
  }

  return {
    base: 0,
    optional: 0
  };
}
function showSong() {
  const id = Number(document.getElementById("songIdInput").value);
  const result = document.getElementById("result");

  const song = songs.find(s => s.id === id);

  if (!song) {
    result.innerHTML = "<p>曲が見つかりません</p>";
    return;
  }


  result.innerHTML = `
    <h2>${song.title}</h2>
    <p>${song.titleen}</p>

    <p><strong>　管理番号：</strong>${song.id}</p>
    <p><strong>　　作曲者：</strong>${formatValue(song.composer)}</p>
    <p><strong>　　編曲者：</strong>${formatValue(song.arranger)}</p>
    <p><strong>　　出版社：</strong>${formatValue(song.publisher)}</p>
    <p><strong>　　　編成：</strong></p>
    ${renderInstrumentation(song.instrumentation)}
    ${renderSolo(song.solo)}
    <p><strong>　パート数：</strong>${song.MinPerformers}パート-${song.MaxPerformers}パート</p>
    <p><strong>　　　タグ：</strong>${song.tags.join(", ")}</p>
    <p><strong>原作・委嘱：</strong>${formatValue(song.original)}</p>
    <p><strong>　グレード：</strong>${song.grade}</p>
    <p><strong>Trp.最高音：</strong>${formatValue(song.trumpetRange)}</p>
    <p><strong>　演奏時間：</strong>${Math.floor(song.durationSeconds / 60)}:${String(song.durationSeconds % 60).padStart(2, "0")}</p>
    ${renderLinks(song.links)}
    <p><strong>　　　備考：</strong>${formatValue(song.notes)}</p>
    <hr>
    <p><strong>　　作成者：</strong>${song.createdBy}</p>
    <p><strong>　最終更新：</strong>${song.updatedAt}</p>
    <p><strong>　　更新者：</strong>${song.updatedBy}</p>
    <p><strong>　承認状態：</strong>${song.approvalStatus}</p>
<p>
  このページにおいて、誤りがある場合は
  <a 
    href="https://docs.google.com/forms/d/e/1FAIpQLSeEBUO5FL0nDbUtPXBHNTME85vI3lMFveCIHwloWUNzsHwZ6w/viewform?usp=pp_url&entry.1222391737=${song.id}" 
    target="_blank"
  >
    誤り報告フォーム
  </a>
  から報告をお願いします。なお、対応が遅れる場合があります。
</p>  `;
}
function searchSongs(query) {
  query = query.toLowerCase();
  return songs.filter(song => {
    return (
      song.title?.toLowerCase().includes(query) ||
      song.composer?.toLowerCase().includes(query) ||
      song.arranger?.toLowerCase().includes(query) ||
      song.tags?.some(tag =>
        tag.toLowerCase().includes(query)
      )
    );
  });
}
function showSearch() {
  const free = document.getElementById("freeSearch").value.toLowerCase();
  const title = document.getElementById("titleSearch").value.toLowerCase();
  const person = document.getElementById("personSearch").value.toLowerCase();

  const result = document.getElementById("result");

  if (!free && !title && !person) {
    result.innerHTML = "";
    return;
  }
  
const hits = songs.filter(song => {

  const titleMatch =
    !title || song.title?.toLowerCase().includes(title);

  const personMatch =
    !person ||
    song.composer?.toLowerCase().includes(person) ||
    song.arranger?.toLowerCase().includes(person);

  const freeMatch =
    !free ||
    song.title?.toLowerCase().includes(free) ||
    song.titleen?.toLowerCase().includes(free) ||
    song.composer?.toLowerCase().includes(free) ||
    song.arranger?.toLowerCase().includes(free) ||
    song.tags?.some(t => t.toLowerCase().includes(free));

  return titleMatch && personMatch && freeMatch;
});

  
if (hits.length === 0) {
  result.innerHTML = `
    <div style="padding:10px;">
      <p>該当する曲が見つかりませんでした。</p>
      <p>検索条件を変更してください。</p>
      <p>キーワードを変えて再検索してください</p>
    </div>
  `;
  return;
}

result.innerHTML = `
<table border="1" style="border-collapse: collapse; width: 100%;">
  <tr>
    <th>番号</th>
    <th>曲名</th>
    <th>作曲者</th>
  </tr>

  ${hits.map(song => `
<tr onclick="showSongById(${song.id})"
    style="cursor:pointer;"
    onmouseover="this.style.background='#f0f0f0'"
    onmouseout="this.style.background='white'">
      <td>${song.id}</td>
      <td>
        <span style="text-decoration: underline;">
          ${song.title}
        </span>
      </td>
      <td>${song.composer}</td>
    </tr>
  `).join("")}
</table>
`;
}
function showSongById(id) {
  const song = songs.find(s => s.id === id);

  if (!song) return;

  document.getElementById("songIdInput").value = id;
  showSong();
}
function getYoutubeId(url) {
  if (!url) return null;
  const match = url.match(/v=([^&]+)/);
  return match ? match[1] : null;
}
function renderYoutube(links) {
  if (!links.youtube) return "";

  const id = getYoutubeId(links.youtube);
  if (!id) return "";

  return `
    <div style="margin-top:10px;">
      <iframe
        width="100%"
        height="315"
        src="https://www.youtube.com/embed/${id}"
        frameborder="0"
        allowfullscreen>
      </iframe>
    </div>
  `;
}
let selectedTags = [];

const tagCategories = {
  雰囲気: ["明るい","楽しい","感動","壮大","幻想的","神秘的","かっこいい","激しい","悲しい","緊張感"],
  世界観: ["和風","西洋風","中世","中国風","民族風","海","空","宇宙","自然","都市","戦い","冒険","祭り","物語","歴史","クリスマス"],
  ジャンル: ["オリジナル","映画","アニメ","ゲーム","J-pop","クラシック編曲","ジャズ","現代音楽"],
  テンポ: ["遅い","中速","速い","変化あり"],
  用途: ["コンクール","吹奏楽コンクール課題曲","定期演奏会","アンコール","アンサンブル","式典"],
  特徴: ["金管主体","木管主体","打楽器多い","ソロあり","技巧的","初心者向け","フレックス（編成柔軟）譜面"],
  スタイル: ["マーチ","ワルツ","ダンス","ファンファーレ","バラード","スウィング","ラテン"],
  編成: ["極小編成","小編成","中編成","大編成"]
};
function openTagPanel() {
  const container = document.getElementById("tagList");

  container.innerHTML = Object.entries(tagCategories).map(([cat, tags]) => `
    <div>
      <h3>${cat}</h3>
      ${tags.map(tag => `
        <label>
          <input type="checkbox" value="${tag}"
            ${selectedTags.includes(tag) ? "checked" : ""}
          >
          ${tag}
        </label>
      `).join("<br>")}
    </div>
    <hr>
  `).join("");

  document.getElementById("tagPanel").style.display = "block";
}
function closeTagPanel() {
  selectedTags = [...document.querySelectorAll("#tagList input:checked")]
    .map(i => i.value);

  document.getElementById("tagPanel").style.display = "none";
}
function applyTagSearch() { //検索//

  selectedTags = [...document.querySelectorAll("#tagList input:checked")]
    .map(i => i.value);

  const result = document.getElementById("result");
  
  //こっから新しいの
    selectedTags = [...document.querySelectorAll("#tagList input:checked")]
    .map(i => i.value);

  document.getElementById("tagPanel").style.display = "none";
//ここまで

  if (selectedTags.length === 0) {
    result.innerHTML = "<p>タグを選択してください</p>";
    return;
  }

  const scored = songs.map(song => {
    const matchCount = song.tags.filter(t =>
      selectedTags.includes(t)
    ).length;

    return {
      song,
      score: matchCount
    };
  });

  const hits = scored
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score);

  result.innerHTML = `
    <table border="1" style="width:100%;" class="search_result">
    <tr>
        <th>一致度</th>
        <th>曲名</th>
        <th>作曲者</th>
        <th>タグ</th>
    </tr>

    ${hits.map(x => `
        <tr onclick="showSongById(${x.song.id})"
            style="cursor:pointer;"
            onmouseover="this.style.backgroundColor='#f0f0f0'"
            onmouseout="this.style.backgroundColor=''">

        <td>${x.score}</td>

        <td>
            <u>${x.song.title}</u>
        </td>

        <td>${x.song.composer}</td>

        <td>
            ${(x.song.tags || []).join(", ")}
        </td>

        </tr>
    `).join("")}
    </table>
    `;
}