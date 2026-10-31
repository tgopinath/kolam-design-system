/*
 * Kolam Auth: Google sign-in (required) and a profile for Gopinath's apps, on Firebase.
 *
 *   <script type="module">
 *     import { KolamAuth } from 'https://tgopinath.github.io/kolam-design-system/auth/kolam-auth.js'
 *     KolamAuth.init({
 *       app: 'farmerfriend', appName: 'FarmerFriend', icon: 'icon-192.png',
 *       fields: [{ key: 'village', label: 'Village or district' }],
 *       sync: ['ff.'],                // localStorage keys (or prefixes) kept in the user's account
 *       avatarSlot: '#profile-slot',  // optional: where the profile button goes (default: top-right corner)
 *     })
 *   </script>
 *
 * Data lives at users/{uid}/apps/{app} in Firestore: { profile: {...}, data: { key: value }, updatedAt }.
 * Sign-in uses a pop-up (redirect only if pop-ups are blocked). Inside the Android (Capacitor) apps, Google blocks web sign-in, so the native
 * @capacitor-firebase/authentication plugin is used when it is present.
 */
import { FIREBASE_CONFIG } from './firebase-config.js'

const SDK = 'https://www.gstatic.com/firebasejs/11.0.2/'
const T = (k, f) => `var(--${k}, ${f})` // Kolam token with a fallback for apps that don't load tokens.css

let fb = null, auth = null, db = null, opts = null, user = null, profile = {}, pushTimer = null, lastSaved = null

const css = `
.ka-gate{position:fixed;inset:0;z-index:2147483600;display:grid;place-items:center;padding:24px;background:${T('bg', '#F4F5F8')};font-family:${T('font-sans', 'Lato, system-ui, sans-serif')};color:${T('ink', '#1F2433')}}
.ka-card{width:min(400px,100%);padding:32px 28px;border-radius:${T('radius-xl', '24px')};background:${T('surface', '#fff')};box-shadow:${T('shadow-2', '0 8px 24px rgba(31,36,51,.12)')};text-align:center}
.ka-icon{width:64px;height:64px;border-radius:16px;margin:0 auto 16px;display:block;object-fit:cover}
.ka-card h1{margin:0 0 8px;font-size:24px;line-height:1.25;font-weight:700}
.ka-card p{margin:0 0 24px;font-size:16px;line-height:1.5;color:${T('ink-2', '#3B4256')}}
.ka-google{display:inline-flex;align-items:center;justify-content:center;gap:12px;width:100%;min-height:48px;padding:0 20px;border-radius:${T('radius-md', '12px')};border:1px solid ${T('line-strong', '#B8BECC')};background:${T('surface', '#fff')};color:${T('ink', '#1F2433')};font:inherit;font-size:16px;font-weight:700;cursor:pointer}
.ka-google:hover{background:${T('surface-sunken', '#EEF0F4')}}
.ka-google:focus-visible,.ka-avatar:focus-visible,.ka-sheet button:focus-visible,.ka-sheet input:focus-visible,.ka-sheet select:focus-visible{outline:3px solid ${T('focus', '#0077B6')};outline-offset:2px}
.ka-google[disabled]{opacity:.6;cursor:progress}
.ka-small{margin:16px 0 0!important;font-size:14px!important;color:${T('ink-muted', '#5B6275')}!important}
.ka-err{margin:16px 0 0;padding:12px;border-radius:${T('radius-sm', '8px')};background:${T('danger-soft', '#FDECEC')};color:${T('danger', '#B42318')};font-size:14px;text-align:left}
.ka-avatar{position:fixed;top:max(12px,env(safe-area-inset-top));right:12px;z-index:2147483500;width:40px;height:40px;padding:0;border-radius:50%;border:2px solid ${T('surface', '#fff')};background:${T('primary-soft', '#E0F1FA')};color:${T('primary-text', '#0070AC')};box-shadow:${T('shadow-1', '0 2px 6px rgba(31,36,51,.16)')};cursor:pointer;overflow:hidden;font:700 15px/1 ${T('font-sans', 'Lato, system-ui, sans-serif')}}
.ka-avatar.in-slot{position:static;flex:none;box-shadow:none;border-color:transparent}
.ka-avatar img{width:100%;height:100%;object-fit:cover;display:block}
.ka-scrim{position:fixed;inset:0;z-index:2147483650;background:${T('scrim', 'rgba(15,18,28,.5)')};display:flex;justify-content:flex-end}
.ka-sheet{width:min(420px,100%);height:100%;overflow:auto;background:${T('surface', '#fff')};color:${T('ink', '#1F2433')};font-family:${T('font-sans', 'Lato, system-ui, sans-serif')};padding:24px;box-sizing:border-box;box-shadow:${T('shadow-3', '0 16px 48px rgba(31,36,51,.24)')}}
.ka-head{display:flex;align-items:center;gap:16px;margin-bottom:24px}
.ka-head img,.ka-head .ka-initial{width:64px;height:64px;border-radius:50%;flex:none;object-fit:cover;background:${T('primary-soft', '#E0F1FA')};color:${T('primary-text', '#0070AC')};display:grid;place-items:center;font-size:24px;font-weight:700}
.ka-head h2{margin:0;font-size:20px;line-height:1.3;font-weight:700}
.ka-head p{margin:4px 0 0;font-size:14px;color:${T('ink-muted', '#5B6275')};word-break:break-all}
.ka-close{margin-left:auto;align-self:flex-start;width:40px;height:40px;border:0;border-radius:50%;background:${T('surface-sunken', '#EEF0F4')};color:${T('ink', '#1F2433')};font-size:20px;cursor:pointer}
.ka-sec{margin:0 0 24px;padding:0;border:0}
.ka-sec h3,.ka-sec legend{margin:0 0 12px;padding:0;font-size:14px;font-weight:700;color:${T('ink-2', '#3B4256')}}
.ka-row{display:flex;justify-content:space-between;gap:12px;padding:8px 0;font-size:14px;border-bottom:1px solid ${T('line', '#E3E6EC')}}
.ka-row span:first-child{color:${T('ink-muted', '#5B6275')}}
.ka-field{display:block;margin-bottom:16px}
.ka-field span{display:block;margin-bottom:6px;font-size:14px;font-weight:700}
.ka-field input,.ka-field select{width:100%;box-sizing:border-box;min-height:48px;padding:0 12px;border-radius:${T('radius-md', '12px')};border:${T('border-control', '1.5px')} solid ${T('line-strong', '#8A91A3')};background:${T('surface', '#fff')};color:${T('ink', '#1F2433')};font:inherit;font-size:16px}
.ka-btn{display:inline-flex;align-items:center;justify-content:center;width:100%;min-height:48px;margin-top:8px;border-radius:${T('radius-md', '12px')};border:1px solid transparent;font:inherit;font-size:16px;font-weight:700;cursor:pointer}
.ka-primary{background:${T('primary', '#0077B6')};color:${T('on-primary', '#fff')}}
.ka-outline{background:${T('surface', '#fff')};color:${T('ink', '#1F2433')};border-color:${T('line-strong', '#B8BECC')}}
.ka-danger{background:transparent;color:${T('danger', '#B42318')};border-color:${T('danger', '#B42318')}}
.ka-note{font-size:14px;color:${T('ink-muted', '#5B6275')};margin:8px 0 0}
.ka-toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:2147483700;padding:12px 16px;border-radius:${T('radius-md', '12px')};background:${T('ink', '#1F2433')};color:#fff;font:14px ${T('font-sans', 'Lato, system-ui, sans-serif')}}
@media (prefers-reduced-motion:no-preference){.ka-sheet{animation:ka-in .2s ease-out}@keyframes ka-in{from{transform:translateX(24px);opacity:.6}}}
`

const GOOGLE_G = '<svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>'

const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild }
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const toast = (msg) => { const t = el(`<div class="ka-toast" role="status">${esc(msg)}</div>`); document.body.appendChild(t); setTimeout(() => t.remove(), 2600) }
const native = () => !!(window.Capacitor?.isNativePlatform?.() && window.Capacitor?.Plugins?.FirebaseAuthentication)
const matches = (key) => (opts.sync || []).some((s) => key === s || (s.endsWith('.') || s.endsWith('-') || s.endsWith(':') || s.endsWith('_') ? key.startsWith(s) : false))
const docRef = () => fb.fs.doc(db, 'users', user.uid, 'apps', opts.app)

async function load() {
  const [app, a, fs] = await Promise.all(['firebase-app.js', 'firebase-auth.js', 'firebase-firestore.js'].map((f) => import(SDK + f)))
  fb = { app, a, fs }
  const inst = app.initializeApp(FIREBASE_CONFIG)
  auth = a.getAuth(inst)
  db = fs.getFirestore(inst)
}

// ---------- sign-in gate ----------
let gate = null
function showGate(error) {
  document.documentElement.style.overflow = 'hidden'
  if (!gate) {
    gate = el(`<div class="ka-gate" role="dialog" aria-modal="true" aria-labelledby="ka-title"><div class="ka-card">
      ${opts.icon ? `<img class="ka-icon" src="${esc(opts.icon)}" alt="">` : ''}
      <h1 id="ka-title">Sign in to ${esc(opts.appName)}</h1>
      <p>${esc(opts.tagline || 'Your data is saved to your account, so it follows you between your phone and the web.')}</p>
      <button type="button" class="ka-google">${GOOGLE_G}<span>Continue with Google</span></button>
      <p class="ka-small">We only use your name, email and photo to set up your profile.</p>
      <div class="ka-err" role="alert" hidden></div></div></div>`)
    gate.querySelector('.ka-google').addEventListener('click', signIn)
    document.body.appendChild(gate)
  }
  const e = gate.querySelector('.ka-err'); e.hidden = !error; e.textContent = error || ''
  gate.querySelector('.ka-google').focus()
}
function hideGate() { gate?.remove(); gate = null; document.documentElement.style.overflow = '' }

async function signIn() {
  const btn = gate?.querySelector('.ka-google'); if (btn) btn.disabled = true
  try {
    const provider = new fb.a.GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    if (native()) {
      const res = await window.Capacitor.Plugins.FirebaseAuthentication.signInWithGoogle()
      const cred = fb.a.GoogleAuthProvider.credential(res.credential?.idToken, res.credential?.accessToken)
      await fb.a.signInWithCredential(auth, cred)
    } else {
      // Pop-up on phones too: redirect sign-in breaks when the app's domain differs from authDomain (storage partitioning).
      try { await fb.a.signInWithPopup(auth, provider) }
      catch (err) { if (err.code === 'auth/popup-blocked') await fb.a.signInWithRedirect(auth, provider); else throw err }
    }
  } catch (err) {
    if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') showGate(friendly(err))
  } finally { if (btn) btn.disabled = false }
}
function friendly(err) {
  const c = err?.code || ''
  if (c === 'auth/unauthorized-domain') return `Sign-in isn't allowed on ${location.hostname} yet. Add it under Firebase → Authentication → Settings → Authorized domains.`
  if (c === 'auth/network-request-failed') return 'No internet connection. Connect and try again.'
  return `Couldn't sign in (${c || err?.message || 'unknown error'}). Try again.`
}

// ---------- data sync ----------
async function pullAndMerge() {
  const snap = await fb.fs.getDoc(docRef())
  const cloud = snap.exists() ? snap.data() : {}
  profile = cloud.profile || {}
  lastSaved = cloud.updatedAt?.toDate?.() || null
  const data = cloud.data || {}
  let changed = false
  if (Object.keys(data).length) {
    for (const [k, v] of Object.entries(data)) if (localStorage.getItem(k) !== v) { origSet.call(localStorage, k, v); changed = true }
  } else {
    await pushNow() // first sign-in on this account: keep what's already on this device
  }
  if (!snap.exists() || !profile.memberSince) await saveProfile({ memberSince: new Date().toISOString() }, false)
  return changed
}
function localData() {
  const out = {}
  for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (matches(k)) out[k] = localStorage.getItem(k) }
  return out
}
async function pushNow() {
  if (!user || !(opts.sync || []).length) return
  await fb.fs.setDoc(docRef(), { data: localData(), updatedAt: fb.fs.serverTimestamp() }, { merge: true })
  lastSaved = new Date()
}
const origSet = Storage.prototype.setItem, origRemove = Storage.prototype.removeItem
function watchStorage() {
  const synced = (k) => user && !opts.demo && matches(String(k))
  const schedule = (k) => { if (synced(k)) { clearTimeout(pushTimer); pushTimer = setTimeout(() => pushNow().catch(() => {}), 1200) } }
  Storage.prototype.setItem = function (k, v) { origSet.call(this, k, v); if (this === localStorage) schedule(k) }
  Storage.prototype.removeItem = function (k) { origRemove.call(this, k); if (this === localStorage) schedule(k) }
  addEventListener('pagehide', () => { if (pushTimer) { clearTimeout(pushTimer); pushNow() } })
}
async function saveProfile(patch, announce = true) {
  profile = { ...profile, ...patch }
  if (opts.demo) { if (announce) toast('Profile saved (demo)'); return }
  await fb.fs.setDoc(docRef(), { profile, updatedAt: fb.fs.serverTimestamp() }, { merge: true })
  if (announce) toast('Profile saved')
  opts.onProfile?.(profile)
}

// ---------- profile ----------
let avatar = null
function mountAvatar() {
  avatar?.remove()
  const slot = typeof opts.avatarSlot === 'string' ? document.querySelector(opts.avatarSlot) : opts.avatarSlot
  avatar = el(`<button type="button" class="ka-avatar${slot ? ' in-slot' : ''}" aria-label="Your profile" aria-haspopup="dialog"></button>`)
  avatar.innerHTML = user.photoURL ? `<img src="${esc(user.photoURL)}" alt="" referrerpolicy="no-referrer">` : esc((user.displayName || user.email || '?')[0].toUpperCase())
  avatar.addEventListener('click', openProfile)
  ;(slot || document.body).appendChild(avatar)
}
function fieldHtml(f) {
  const v = profile[f.key] ?? ''
  const input = f.type === 'select'
    ? `<select name="${esc(f.key)}">${['', ...f.options].map((o) => { const [val, lab] = Array.isArray(o) ? o : [o, o || 'Choose…']; return `<option value="${esc(val)}"${String(v) === String(val) ? ' selected' : ''}>${esc(lab)}</option>` }).join('')}</select>`
    : `<input name="${esc(f.key)}" type="${f.type === 'number' ? 'number' : 'text'}" value="${esc(v)}" placeholder="${esc(f.placeholder || '')}" ${f.type === 'number' ? 'inputmode="decimal" min="0" step="any"' : ''} autocomplete="off">`
  return `<label class="ka-field"><span>${esc(f.label)}</span>${input}</label>`
}
function openProfile() {
  const since = profile.memberSince ? new Date(profile.memberSince).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : 'Today'
  const saved = lastSaved ? lastSaved.toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : 'Not yet'
  const scrim = el(`<div class="ka-scrim"><section class="ka-sheet" role="dialog" aria-modal="true" aria-labelledby="ka-name">
    <div class="ka-head">${user.photoURL ? `<img src="${esc(user.photoURL)}" alt="" referrerpolicy="no-referrer">` : `<span class="ka-initial">${esc((user.displayName || '?')[0])}</span>`}
      <div><h2 id="ka-name">${esc(user.displayName || 'Your profile')}</h2><p>${esc(user.email || '')}</p></div>
      <button type="button" class="ka-close" aria-label="Close profile">×</button></div>
    <div class="ka-sec"><h3>Account</h3>
      <div class="ka-row"><span>Signed in with</span><span>Google</span></div>
      <div class="ka-row"><span>Member since</span><span>${esc(since)}</span></div>
      ${(opts.sync || []).length ? `<div class="ka-row"><span>Last saved to your account</span><span>${esc(saved)}</span></div>` : ''}</div>
    ${(opts.fields || []).length ? `<form class="ka-sec ka-form"><h3>Your ${esc(opts.appName)} details</h3>${opts.fields.map(fieldHtml).join('')}<button class="ka-btn ka-primary" type="submit">Save details</button></form>` : ''}
    <div class="ka-sec"><button type="button" class="ka-btn ka-outline ka-signout">Sign out</button>
      <button type="button" class="ka-btn ka-danger ka-delete">Delete my ${esc(opts.appName)} data</button>
      <p class="ka-note">Deleting removes this app's data from your account and this device. Your Google account isn't affected.</p></div>
  </section></div>`)
  const close = () => { scrim.remove(); avatar?.focus() }
  scrim.addEventListener('click', (e) => { if (e.target === scrim) close() })
  scrim.addEventListener('keydown', (e) => { if (e.key === 'Escape') close() })
  scrim.querySelector('.ka-close').addEventListener('click', close)
  scrim.querySelector('.ka-form')?.addEventListener('submit', async (e) => {
    e.preventDefault(); const patch = {}
    for (const f of opts.fields) { const v = e.target.elements[f.key].value.trim(); patch[f.key] = f.type === 'number' && v !== '' ? Number(v) : v }
    try { await saveProfile(patch) } catch { toast("Couldn't save. Check your connection.") }
  })
  scrim.querySelector('.ka-signout').addEventListener('click', async () => { if (opts.demo) { close(); avatar.remove(); user = null; showGate(); return } await pushNow().catch(() => {}); await fb.a.signOut(auth); close() })
  scrim.querySelector('.ka-delete').addEventListener('click', async () => {
    if (!confirm(`Delete all your ${opts.appName} data? This can't be undone.`)) return
    if (opts.demo) { toast('Deleted (demo)'); close(); return }
    await fb.fs.deleteDoc(docRef())
    Object.keys(localData()).forEach((k) => origRemove.call(localStorage, k))
    await fb.a.signOut(auth); close(); location.reload()
  })
  document.body.appendChild(scrim)
  scrim.querySelector('.ka-close').focus()
}

// ---------- start ----------
export const KolamAuth = {
  get user() { return user }, get profile() { return profile },
  openProfile: () => user && openProfile(),
  signOut: () => fb && fb.a.signOut(auth),
  save: () => pushNow(),
  async init(options) {
    opts = { sync: [], fields: [], ...options }
    document.head.appendChild(el(`<style id="kolam-auth-css">${css}</style>`))
    if (opts.demo) {
      await (document.body ? null : new Promise((r) => addEventListener('DOMContentLoaded', r, { once: true })))
      showGate()
      gate.querySelector('.ka-google').onclick = (e) => { e.stopImmediatePropagation(); user = { uid: 'demo', displayName: 'Gopinath Thandapani', email: 'you@example.com', photoURL: opts.demoPhoto || '' }; profile = { memberSince: new Date().toISOString() }; hideGate(); mountAvatar(); opts.onReady?.(user, profile) }
      return
    }
    if (!FIREBASE_CONFIG?.apiKey) { showGate('Sign-in is not configured yet (missing Firebase config).'); gate.querySelector('.ka-google').disabled = true; return }
    const ready = () => (document.body ? Promise.resolve() : new Promise((r) => addEventListener('DOMContentLoaded', r, { once: true })))
    await ready()
    showGate()
    await load()
    watchStorage()
    fb.a.getRedirectResult(auth).catch((err) => showGate(friendly(err)))
    fb.a.onAuthStateChanged(auth, async (u) => {
      user = u
      if (!u) { avatar?.remove(); showGate(); return }
      try {
        const changed = await pullAndMerge()
        if (changed && !sessionStorage.getItem('ka-reloaded')) { sessionStorage.setItem('ka-reloaded', '1'); location.reload(); return }
        sessionStorage.removeItem('ka-reloaded')
      } catch (err) { console.warn('Kolam Auth: could not sync', err) }
      hideGate(); mountAvatar(); opts.onReady?.(u, profile)
    })
  },
}
window.KolamAuth = KolamAuth
