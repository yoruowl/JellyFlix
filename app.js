const $ = s => document.querySelector(s);
const demo = [
  {Id:'d1',Name:'The Last Horizon',Type:'Movie',Year:'2024',Overview:'Beyond the edge of everything familiar, a journey into the unknown becomes a story of finding your way home.',img:'photo-1500530855697-b586d89ba3ee',tag:'A JOURNEY BEYOND'},
  {Id:'d2',Name:'Into the Wild',Type:'Movie',Year:'2023',Overview:'Leave the ordinary behind and follow the road wherever it leads.',img:'photo-1472396961693-142e6e269027',tag:'AN ORIGINAL STORY'},
  {Id:'d3',Name:'After the Rain',Type:'Series',Year:'2024',Overview:'In a city full of strangers, unexpected connections change everything.',img:'photo-1519608487953-e999c86e7455',tag:'NEW EPISODES'},
  {Id:'d4',Name:'Blue Hour',Type:'Movie',Year:'2022',Overview:'A quiet escape to the edge of the world reveals a new beginning.',img:'photo-1470770841072-f978cf4d019e',tag:'A FILM BY JELLYFLIX'},
  {Id:'d5',Name:'The Crossing',Type:'Series',Year:'2024',Overview:'Every path has a story. This one is just beginning.',img:'photo-1464822759023-fed622ff2c3b',tag:'LIMITED SERIES'},
  {Id:'d6',Name:'Golden State',Type:'Movie',Year:'2023',Overview:'Long days, open roads, and the moments that stay with us.',img:'photo-1500534623283-312aade485b7',tag:'A NEW ADVENTURE'},
  {Id:'d7',Name:'Nightfall',Type:'Series',Year:'2022',Overview:'When the lights go down, the city comes alive.',img:'photo-1519501025264-65ba15a82390',tag:'THE SERIES'},
  {Id:'d8',Name:'The Great Escape',Type:'Movie',Year:'2021',Overview:'A little distance can change your perspective on everything.',img:'photo-1500534314209-a25ddb2bd429',tag:'FIND YOUR WAY'},
  {Id:'d9',Name:'Northern Lights',Type:'Series',Year:'2024',Overview:'Under an endless sky, extraordinary stories unfold.',img:'photo-1483347756197-71ef80e95f73',tag:'A WORLD OF WONDER'},
  {Id:'d10',Name:'Open Water',Type:'Movie',Year:'2023',Overview:'A story of courage, discovery, and the pull of the ocean.',img:'photo-1500375592092-40eb2168fd21',tag:'DIVE DEEPER'}
];
let session = null;
try { session = JSON.parse(localStorage.getItem('jellyflix-session')); } catch { localStorage.removeItem('jellyflix-session'); }
let allItems = demo, currentView = 'home', currentFeatured = demo[0], searchTerm = '';
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const image = (item, type = 'Primary') => session && !demo.includes(item) ? `${session.server}/Items/${encodeURIComponent(item.Id)}/Images/${type}?maxWidth=900&quality=85&ApiKey=${encodeURIComponent(session.token)}` : `https://images.unsplash.com/${item.img}?auto=format&fit=crop&w=800&q=80`;
const clientAuthorization = 'MediaBrowser Client="JellyFlix", Device="Web Browser", DeviceId="jellyflix-web", Version="1.0.0"';
const authHeaders = () => ({Authorization: `${clientAuthorization}, Token="${session.token}"`});
async function api(path, options = {}) { const response = await fetch(`${session.server}${path}`, {...options, headers:{...authHeaders(),...options.headers}}); if (!response.ok) throw new Error(`Server returned ${response.status}`); return response.json(); }
function toast(message){ const el=$('#toast'); el.textContent=message; el.classList.remove('hidden'); clearTimeout(toast.timer); toast.timer=setTimeout(()=>el.classList.add('hidden'),3000); }
function card(item, index){return `<button class="media-card" data-id="${esc(item.Id)}" aria-label="Details for ${esc(item.Name)}"><img src="${esc(image(item, item.BackdropImageTags?.length ? 'Backdrop' : 'Primary'))}" alt="" loading="lazy"><span class="card-gradient"></span><span class="card-number"><b>J</b> &nbsp; ${String(index+1).padStart(2,'0')}</span><span class="card-title">${esc(item.Name)}</span>${item.tag?`<span class="card-sub">${esc(item.tag)}</span>`:''}</button>`;}
function row(title, subtitle, items){if(!items.length)return '';return `<div class="media-row"><div class="row-heading"><h3>${esc(title)}</h3><span>${esc(subtitle)}</span></div><div class="row-scroll">${items.map(card).join('')}</div></div>`;}
function render(){
  let items=allItems.filter(i=>!searchTerm || `${i.Name} ${(i.Genres||[]).join(' ')}`.toLowerCase().includes(searchTerm.toLowerCase()));
  if(currentView==='Movie'||currentView==='Series') items=items.filter(i=>i.Type===currentView);
  if(currentView==='favorites') items=items.filter(i=>session ? i.UserData?.IsFavorite : (JSON.parse(localStorage.getItem('jellyflix-favorites')||'[]')).includes(i.Id));
  $('#hero').style.display=(currentView==='home'&&!searchTerm&&allItems.length)?'':'none';
  $('.section-heading h2').innerHTML=searchTerm?`Search results<span>.</span>`:currentView==='Movie'?`Movie night starts here<span>.</span>`:currentView==='Series'?`Find your next series<span>.</span>`:currentView==='favorites'?`Your list<span>.</span>`:`It's good to see you<span>.</span>`;
  $('.section-heading p').textContent=searchTerm?`Results for “${searchTerm}”`:currentView==='favorites'?'The stories you saved for later.':'Your next great watch is waiting right here.';
  $('#content').style.paddingTop=(currentView==='home'&&!searchTerm)?'':'120px';
  if(!items.length){$('#rows').innerHTML='<p class="empty">Nothing here yet. Try another search or explore your library.</p>';return;}
  $('#rows').innerHTML=(currentView==='home'&&!searchTerm) ? row('Trending Now','A LITTLE SOMETHING FOR EVERYONE',items.slice(0,10))+row('Your Next Obsession','STORIES WORTH STAYING UP FOR',items.slice(3).concat(items.slice(0,3)).slice(0,10))+row('Made for Movie Night','GET COMFORTABLE',items.filter(i=>i.Type==='Movie')) : row(currentView==='favorites'?'Saved for Later':searchTerm?'Results':currentView==='Series'?'TV Shows':'Movies',`${items.length} TITLES`,items);
}
function setHero(item){currentFeatured=item; $('.hero-image').style.backgroundImage=`url("${image(item, item.BackdropImageTags?.length ? 'Backdrop':'Primary')}")`; $('.hero h1').textContent=item.Name; $('.hero-tagline').textContent=session?'Your next story starts here.':'Some journeys change everything.'; $('.hero-description').textContent=item.Overview||'Discover something great in your personal library.';}
async function loadLibrary(){
  if(!session){allItems=demo;setHero(demo[0]);render();return;}
  try{const data=await api(`/Users/${encodeURIComponent(session.userId)}/Items?Recursive=true&IncludeItemTypes=Movie,Series&Fields=Overview,Genres,BackdropImageTags,PrimaryImageAspectRatio&SortBy=DateCreated&SortOrder=Descending&Limit=200`);allItems=data.Items||[];$('#connection-label').textContent=`Connected as ${session.name}`;if(allItems.length)setHero(allItems[0]);else $('#hero').style.display='none';render();}catch(e){toast('Could not load your library. Check your server connection.');console.error(e);}
}
function closeModal(){$('#modal').classList.add('hidden');}
function showModal(html){$('.modal-card').classList.remove('series-modal');$('#modal-content').innerHTML=html;$('#modal').classList.remove('hidden');$('#modal .modal-close').focus();}
function account(){
 if(session){showModal(`<div class="modal-body"><div class="section-kicker"><span></span> YOUR ACCOUNT</div><h2 id="modal-title">You're connected<span>.</span></h2><p>Signed in as <strong>${esc(session.name)}</strong> on ${esc(session.server)}.</p><button class="button button-red" id="disconnect">Disconnect server</button></div>`);$('#disconnect').onclick=()=>{localStorage.removeItem('jellyflix-session');session=null;$('#connection-label').textContent='Explore demo library';closeModal();loadLibrary();};return;}
 showModal(`<div class="modal-body"><div class="section-kicker"><span></span> YOUR LIBRARY, YOUR WAY</div><h2 id="modal-title">Let's get you connected<span>.</span></h2><p>Bring your own collection to JellyFlix. Sign in with your Jellyfin server details to start watching.</p><form id="login"><label for="server">Server address</label><input id="server" type="url" placeholder="https://your-jellyfin-server.com" required><label for="username">Username</label><input id="username" autocomplete="username" required><label for="password">Password</label><input id="password" type="password" autocomplete="current-password"><p class="modal-note">Your credentials are sent directly to your Jellyfin server. Your browser may require the server to allow cross-origin requests.</p><p class="error" id="login-error" role="alert"></p><button class="button button-red" type="submit">Connect to Jellyfin &nbsp; →</button></form></div>`);
 $('#login').onsubmit=async e=>{e.preventDefault();const btn=e.target.querySelector('button');btn.disabled=true;btn.textContent='Connecting…';try{const server=$('#server').value.trim().replace(/\/+$/,'');const response=await fetch(`${server}/Users/AuthenticateByName`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:clientAuthorization},body:JSON.stringify({Username:$('#username').value, Pw:$('#password').value})});if(!response.ok)throw new Error(response.status===401 || response.status===403 ? `Jellyfin rejected the sign-in (HTTP ${response.status}). Check your credentials and account access on the server.` : `Jellyfin could not complete sign-in (HTTP ${response.status}). Check the server address and server logs.`);const data=await response.json();session={server,token:data.AccessToken,userId:data.User.Id,name:data.User.Name};localStorage.setItem('jellyflix-session',JSON.stringify(session));closeModal();await loadLibrary();toast('Connected to your Jellyfin library');}catch(err){$('#login-error').textContent=err instanceof TypeError?'Could not reach the server. Check the address and cross-origin settings.':err.message;}finally{btn.disabled=false;btn.textContent='Connect to Jellyfin →';}};
}
function details(item){
  let fav=session?!!item.UserData?.IsFavorite:JSON.parse(localStorage.getItem('jellyflix-favorites')||'[]').includes(item.Id);
  const isSeries=item.Type==='Series';
  showModal(`<div class="modal-art" style="background-image:url('${esc(image(item,item.BackdropImageTags?.length?'Backdrop':'Primary'))}')"></div><div class="modal-body"><div class="section-kicker"><span></span> ${isSeries?'SERIES':'FEATURE FILM'}</div><h2 id="modal-title">${esc(item.Name)}<span>.</span></h2><div class="detail-meta">${esc(item.ProductionYear||item.Year||'')} &nbsp; ${esc(item.OfficialRating||'')} &nbsp; ${esc((item.Genres||[]).slice(0,2).join(' · '))}</div><p>${esc(item.Overview||'Discover this story in your Jellyfin library.')}</p><div class="detail-actions"><button class="button button-light" id="detail-play">▶ &nbsp; Play</button><button class="button button-muted" id="favorite">${fav?'✓ In My List':'+ My List'}</button></div>${isSeries?'<section class="episodes-section" aria-label="Episodes"><div class="episodes-heading"><h3>Episodes</h3><label class="season-label">Season <select id="season-select" aria-label="Select season" disabled><option>Loading…</option></select></label></div><div id="episode-list" aria-live="polite"><p class="episode-message">Loading episodes…</p></div></section>':''}</div>`);
  $('#detail-play').onclick=()=>play(item);
  $('#favorite').onclick=async()=>{try{if(session){await fetch(`${session.server}/Users/${encodeURIComponent(session.userId)}/FavoriteItems/${encodeURIComponent(item.Id)}`,{method:fav?'DELETE':'POST',headers:authHeaders()}).then(r=>{if(!r.ok)throw Error()});item.UserData={...item.UserData,IsFavorite:!fav};}else{let ids=JSON.parse(localStorage.getItem('jellyflix-favorites')||'[]');ids=fav?ids.filter(id=>id!==item.Id):[...ids,item.Id];localStorage.setItem('jellyflix-favorites',JSON.stringify(ids));}fav=!fav;$('#favorite').textContent=fav?'✓ In My List':'+ My List';render();toast(fav?'Added to My List':'Removed from My List');}catch{toast('Could not update My List');}};
  if(isSeries){$('.modal-card').classList.add('series-modal');loadSeasons(item, $('#episode-list'), $('#season-select'));}
}
function demoEpisodes(series, season){
  return ['A New Beginning','The Road Ahead','Crossing Paths'].map((name,index)=>({Id:`${series.Id}-s${season}-e${index+1}`,Name:name,Type:'Episode',IndexNumber:index+1,RunTimeTicks:(42+index*3)*600000000,Overview:['Every story starts somewhere. Discover the moments that set everything in motion.','As the journey unfolds, a new chapter brings unexpected possibilities.','The road brings familiar faces together in surprising ways.'][index],img:series.img}));
}
async function loadSeasons(series, list, select){
  const isCurrent=()=>select.isConnected && !$('#modal').classList.contains('hidden');
  try{
    const seasons=session?(await api(`/Shows/${encodeURIComponent(series.Id)}/Seasons?UserId=${encodeURIComponent(session.userId)}`)).Items||[]:[{Id:'1',Name:'Season 1'},{Id:'2',Name:'Season 2'}];
    if(!isCurrent())return;
    if(!seasons.length){select.innerHTML='<option>No seasons</option>';list.innerHTML='<p class="episode-message">No seasons are available for this series.</p>';return;}
    select.innerHTML=seasons.map(season=>`<option value="${esc(season.Id)}">${esc(season.Name||`Season ${season.IndexNumber ?? ''}`)}</option>`).join('');select.disabled=false;
    let request=0;
    async function loadEpisodes(){
      const current=++request, seasonId=select.value;list.innerHTML='<p class="episode-message">Loading episodes…</p>';
      try{
        const episodes=session?(await api(`/Shows/${encodeURIComponent(series.Id)}/Episodes?UserId=${encodeURIComponent(session.userId)}&SeasonId=${encodeURIComponent(seasonId)}&Fields=Overview`)).Items||[]:demoEpisodes(series,seasonId);
        if(!isCurrent()||current!==request)return;
        if(!episodes.length){list.innerHTML='<p class="episode-message">No episodes are available in this season.</p>';return;}
        list.innerHTML=episodes.map((episode,index)=>{
          const hasImage=session?!!episode.ImageTags?.Primary:true;
          const art=hasImage?image(episode):image(series,series.BackdropImageTags?.length?'Backdrop':'Primary');
          const minutes=episode.RunTimeTicks?`${Math.round(episode.RunTimeTicks/600000000)} min`:'';
          return `<button class="episode" data-episode-index="${index}" aria-label="Play ${esc(episode.Name||`Episode ${index+1}`)}"><span class="episode-number">${esc(episode.IndexNumber ?? index+1)}</span><span class="episode-image"><img src="${esc(art)}" alt="" loading="lazy"><span class="episode-play">▶</span></span><span class="episode-copy"><span class="episode-title">${esc(episode.Name||`Episode ${index+1}`)}<span class="episode-duration">${esc(minutes)}</span></span><span class="episode-overview">${esc(episode.Overview||'')}</span></span></button>`;
        }).join('');
        list.onclick=e=>{const button=e.target.closest('[data-episode-index]');if(button)play(episodes[Number(button.dataset.episodeIndex)]);};
      }catch{if(isCurrent()&&current===request)list.innerHTML='<p class="episode-message">Could not load episodes. Please try selecting the season again.</p>';}
    }
    select.onchange=loadEpisodes;await loadEpisodes();
  }catch{if(isCurrent()){select.innerHTML='<option>Unavailable</option>';list.innerHTML='<p class="episode-message">Could not load seasons. Close this window and try again.</p>';}}
}
let playback = null, playbackGeneration = 0, subtitleGeneration = 0, subtitleUrl = null, hlsPlayer = null, audioSwitchGeneration = 0;
function destroyHls(){audioSwitchGeneration++;if(hlsPlayer){hlsPlayer.destroy();hlsPlayer=null;}$('#video').onloadedmetadata=null;}
function clearSubtitle(){
  subtitleGeneration++;
  const video=$('#video');
  video.querySelectorAll('track[data-jellyflix]').forEach(track=>track.remove());
  if(subtitleUrl){URL.revokeObjectURL(subtitleUrl);subtitleUrl=null;}
}
function closeTrackMenu(){$('#track-menu').classList.add('hidden');$('#track-toggle').setAttribute('aria-expanded','false');}
function trackLabel(stream){return stream.DisplayTitle||stream.Title||[stream.Language?.toUpperCase(),stream.Codec?.toUpperCase()].filter(Boolean).join(' · ')||`Track ${stream.Index}`;}
function trackMessage(message){$('#track-message').textContent=message;}
async function loadTracks(item, generation){
  const audio=$('#audio-select'), subtitles=$('#subtitle-select');
  audio.disabled=true;subtitles.disabled=true;audio.innerHTML='<option>Loading tracks…</option>';subtitles.innerHTML='<option>Loading tracks…</option>';trackMessage('');
  try{
    const info=await api(`/Users/${encodeURIComponent(session.userId)}/Items/${encodeURIComponent(item.Id)}?Fields=MediaSources`);
    if(generation!==playbackGeneration)return;
    const source=info.MediaSources?.[0];
    if(!source)throw new Error('No media source available');
    playback={item,source};
    const streams=source.MediaStreams||info.MediaStreams||[];
    const audioStreams=streams.filter(stream=>stream.Type==='Audio');
    const subtitleStreams=streams.filter(stream=>stream.Type==='Subtitle');
    const defaultAudio=source.DefaultAudioStreamIndex ?? audioStreams.find(stream=>stream.IsDefault)?.Index ?? audioStreams[0]?.Index;
    audio.innerHTML=audioStreams.length?audioStreams.map(stream=>`<option value="${esc(stream.Index)}" ${stream.Index===defaultAudio?'selected':''}>${esc(trackLabel(stream))}</option>`).join(''):'<option>No audio tracks available</option>';
    audio.disabled=audioStreams.length<2;
    subtitles.innerHTML='<option value="">Off</option>'+subtitleStreams.map(stream=>{const unsupported=stream.IsTextSubtitleStream===false;return `<option value="${esc(stream.Index)}" ${unsupported?'disabled':''}>${esc(trackLabel(stream))}${unsupported?' (image format not supported)':''}</option>`;}).join('');
    subtitles.disabled=!subtitleStreams.some(stream=>stream.IsTextSubtitleStream!==false);
    if(subtitleStreams.some(stream=>stream.IsTextSubtitleStream===false))trackMessage('Image-based subtitles are not supported by this player.');
  }catch{if(generation===playbackGeneration){audio.innerHTML='<option>Tracks unavailable</option>';subtitles.innerHTML='<option>Tracks unavailable</option>';trackMessage('Could not load tracks from Jellyfin.');}}
}
async function selectSubtitle(){
  clearSubtitle();const selected=$('#subtitle-select').value;if(!selected||!playback)return;
  const generation=subtitleGeneration, active=playback;
  const url=`${session.server}/Videos/${encodeURIComponent(active.item.Id)}/${encodeURIComponent(active.source.Id)}/Subtitles/${encodeURIComponent(selected)}/Stream.vtt?ApiKey=${encodeURIComponent(session.token)}`;
  try{
    const response=await fetch(url);if(!response.ok)throw new Error();const data=await response.blob();
    if(generation!==subtitleGeneration||playback!==active)return;
    subtitleUrl=URL.createObjectURL(data);const track=document.createElement('track');track.dataset.jellyflix='true';track.kind='subtitles';track.label=$('#subtitle-select').selectedOptions[0].textContent;track.src=subtitleUrl;track.default=true;$('#video').appendChild(track);track.track.mode='showing';
    trackMessage('');
  }catch{if(generation===subtitleGeneration){$('#subtitle-select').value='';trackMessage('Could not load this subtitle track from Jellyfin.');}}
}
function selectAudio(){
  if(!playback)return;
  const video=$('#video'), time=video.currentTime, wasPlaying=!video.paused;
  const useNative=!!video.canPlayType('application/vnd.apple.mpegurl');
  const useHls=typeof Hls!=='undefined' && Hls.isSupported();
  if(!useNative&&!useHls){trackMessage('Your browser does not support HLS audio switching.');return;}
  const videoStream=(playback.source.MediaStreams||[]).find(stream=>stream.Type==='Video');
  // Allow Jellyfin to copy H.264 video; if it must encode, retain a generous source-based bitrate.
  const bitrate=Math.max(8000000, Math.min(100000000, Number(videoStream?.BitRate || playback.source.Bitrate || 20000000)));
  const params=new URLSearchParams({MediaSourceId:playback.source.Id,AudioStreamIndex:$('#audio-select').value,VideoCodec:'h264',AudioCodec:'aac',VideoBitrate:String(bitrate),AudioBitrate:'320000',AllowVideoStreamCopy:'true',SegmentContainer:'ts',MinSegments:'1',ApiKey:session.token});
  const url=`${session.server}/Videos/${encodeURIComponent(playback.item.Id)}/master.m3u8?${params}`;
  destroyHls();const generation=audioSwitchGeneration;
  video.pause();video.removeAttribute('src');video.load();
  video.onloadedmetadata=()=>{if(generation!==audioSwitchGeneration)return;video.onloadedmetadata=null;if(Number.isFinite(time))video.currentTime=time;if(wasPlaying)video.play().catch(()=>toast('Press play to continue watching'));};
  if(useNative){video.src=url;video.load();}
  else{
    hlsPlayer=new Hls();
    hlsPlayer.on(Hls.Events.ERROR,(_event,data)=>{if(data.fatal&&generation===audioSwitchGeneration)trackMessage('Could not switch audio. Check whether your Jellyfin server allows transcoding.');});
    hlsPlayer.loadSource(url);hlsPlayer.attachMedia(video);
  }
  trackMessage('Changing audio may take a moment while Jellyfin prepares the stream.');
}
async function play(item){if(!session){closeModal();account();toast('Connect your Jellyfin server to play your media');return;}try{let playable=item;if(item.Type==='Series'){const data=await api(`/Shows/${encodeURIComponent(item.Id)}/Episodes?UserId=${encodeURIComponent(session.userId)}&Limit=1&Fields=MediaSources`);playable=data.Items?.[0];if(!playable)throw Error('No episodes found');}closeModal();clearSubtitle();closeTrackMenu();destroyHls();playback=null;const generation=++playbackGeneration;const video=$('#video');video.src=`${session.server}/Videos/${encodeURIComponent(playable.Id)}/stream?static=true&ApiKey=${encodeURIComponent(session.token)}`;$('#player').classList.remove('hidden');loadTracks(playable,generation);video.play().catch(()=>toast('Press play to start watching'));}catch(e){toast(e.message||'Unable to play this title');}}
$('#track-toggle').onclick=()=>{const open=$('#track-menu').classList.toggle('hidden')===false;$('#track-toggle').setAttribute('aria-expanded',String(open));};
$('#audio-select').onchange=selectAudio;$('#subtitle-select').onchange=selectSubtitle;
$('#video').addEventListener('error',()=>{if(!$('#player').classList.contains('hidden'))trackMessage('Playback failed. Your server may not support the selected stream or transcoding.');});
$('#rows').addEventListener('click',e=>{const card=e.target.closest('[data-id]');if(card){const item=allItems.find(i=>i.Id===card.dataset.id);if(item)details(item);}});
$('.nav nav').addEventListener('click',e=>{const button=e.target.closest('[data-view]');if(!button)return;currentView=button.dataset.view;searchTerm='';$('#search').value='';document.querySelectorAll('.nav-link').forEach(x=>x.classList.toggle('active',x===button));render();window.scrollTo({top:0,behavior:'smooth'});});
$('.brand').onclick=()=>{currentView='home';searchTerm='';document.querySelectorAll('.nav-link').forEach(x=>x.classList.toggle('active',x.dataset.view==='home'));render();};
$('.search-toggle').onclick=()=>{$('.search-box').classList.add('open');$('#search').focus();};$('.search-close').onclick=()=>{$('.search-box').classList.remove('open');$('#search').value='';searchTerm='';render();};$('#search').oninput=e=>{searchTerm=e.target.value;render();};
$('#account').onclick=account;$('#connect-inline').onclick=account;$('#hero-info').onclick=()=>details(currentFeatured);$('#hero-play').onclick=()=>play(currentFeatured);$('.modal-close').onclick=closeModal;$('#modal').onclick=e=>{if(e.target.id==='modal')closeModal();};$('.player-close').onclick=()=>{playbackGeneration++;playback=null;clearSubtitle();closeTrackMenu();destroyHls();$('#video').pause();$('#video').removeAttribute('src');$('#video').load();$('#player').classList.add('hidden');};document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();if(!$('#player').classList.contains('hidden'))$('.player-close').click();}});
loadLibrary();
