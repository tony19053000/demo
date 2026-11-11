const ACCOUNTS = 'sense-demo-accounts-v1';
const SESSION = 'sense-demo-session-v1';
const iterations = 210000;
const emailKey = email => String(email).trim().toLowerCase();
const hex = bytes => Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
const unhex = value => Uint8Array.from(value.match(/.{2}/g)||[],byte=>parseInt(byte,16));

// This is a local demonstration, not a security boundary or remote identity.
export function createDemoAuth(storage, session, cryptoApi) {
  function accounts() {
    const raw=storage.getItem(ACCOUNTS);
    if (!raw) return [];
    const data=JSON.parse(raw);
    if (!Array.isArray(data)) throw new Error('Saved demo accounts could not be read.');
    return data;
  }
  const publicProfile = account => ({id:account.id,name:account.name,email:account.email});
  async function derive(password,salt) {
    const key=await cryptoApi.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
    return hex(new Uint8Array(await cryptoApi.subtle.deriveBits({name:'PBKDF2',salt:unhex(salt),iterations,hash:'SHA-256'},key,256)));
  }
  function signIn(account) {
    session.setItem(SESSION,account.id);
    return publicProfile(account);
  }
  return {
    async register({name,email,password}) {
      const normalized=emailKey(email);
      if (!name.trim() || name.trim().length>40) throw new Error('Enter a name of up to 40 characters.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) throw new Error('Enter a valid email address.');
      if (password.length<8 || password.length>128) throw new Error('Use a password with 8â€“128 characters.');
      const salt=hex(cryptoApi.getRandomValues(new Uint8Array(16)));
      const hash=await derive(password,salt);
      const saved=accounts();
      if(saved.some(a=>a.email===normalized)) throw new Error('An account with this email already exists. Please log in.');
      const account={id:cryptoApi.randomUUID(),name:name.trim(),email:normalized,salt,hash};
      storage.setItem(ACCOUNTS,JSON.stringify([...saved,account]));
      return signIn(account);
    },
    async login({email,password}) {
      const account=accounts().find(a=>a.email===emailKey(email));
      if (!account || await derive(password,account.salt)!==account.hash) throw new Error('Email or password is incorrect.');
      return signIn(account);
    },
    current() {
      try {const account=accounts().find(a=>a.id===session.getItem(SESSION));return account?publicProfile(account):null;} catch {return null;}
    },
    update(profile) {
      const saved=accounts();
      const id=session.getItem(SESSION);
      const account=saved.find(a=>a.id===id);
      if(!account) throw new Error('Please log in again.');
      const name=profile.name.trim();
      if(!name || name.length>40) throw new Error('Enter a name of up to 40 characters.');
      account.name=name;
      storage.setItem(ACCOUNTS,JSON.stringify(saved));
      return publicProfile(account);
    },
    async changePassword(currentPassword, newPassword) {
      const id=session.getItem(SESSION);
      const account=accounts().find(a=>a.id===id);
      if (!account || await derive(currentPassword,account.salt)!==account.hash)
        throw new Error('Current password is incorrect.');
      if (newPassword.length<8 || newPassword.length>128)
        throw new Error('Use a password with 8–128 characters.');
      const salt=hex(cryptoApi.getRandomValues(new Uint8Array(16)));
      const hash=await derive(newPassword,salt);
      const saved=accounts();
      const current=saved.find(a=>a.id===id);
      if (id!==session.getItem(SESSION) || current?.hash!==account.hash)
        throw new Error('Your account changed. Please try again.');
      Object.assign(current,{salt,hash});
      storage.setItem(ACCOUNTS,JSON.stringify(saved));
    },
    logout() {session.removeItem(SESSION);},
  };
}
