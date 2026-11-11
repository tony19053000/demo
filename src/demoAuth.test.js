import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { createDemoAuth } from './demoAuth.js';
function memory(){const values=new Map();return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key),values};}
test('demo registration, login, profile update and sign-out lifecycle',async()=>{
  const storage=memory(),session=memory(),auth=createDemoAuth(storage,session,webcrypto);
  const user=await auth.register({name:' Demo ',email:' Demo@Example.com ',password:'demo-password-123'});
  assert.equal(user.name,'Demo');assert.equal(user.email,'demo@example.com');
  assert.deepEqual(auth.current(),user);
  const stored=JSON.parse(storage.getItem('sense-demo-accounts-v1'))[0];
  assert.ok(stored.salt);assert.ok(stored.hash);assert.ok(!JSON.stringify(stored).includes('demo-password-123'));
  assert.ok(!('hash' in user));
  auth.update({...user,name:'Updated'});auth.logout();assert.equal(auth.current(),null);
  await assert.rejects(auth.login({email:user.email,password:'incorrect'}),/incorrect/);
  assert.equal(auth.current(),null);
  assert.equal((await auth.login({email:'DEMO@example.com',password:'demo-password-123'})).name,'Updated');
  await assert.rejects(auth.register({name:'Again',email:user.email,password:'another-password'}),/already exists/);
  auth.logout();await assert.rejects(auth.login({email:'missing@example.com',password:'demo-password-123'}),/incorrect/);
  assert.equal(createDemoAuth(storage,memory(),webcrypto).current(),null,'new session is signed out');
});
test('demo validates registration and salts identical passwords independently',async()=>{
  const storage=memory(),auth=createDemoAuth(storage,memory(),webcrypto);
  await assert.rejects(auth.register({name:'',email:'a@b.com',password:'long-password'}),/name/);
  await assert.rejects(auth.register({name:'A',email:'invalid',password:'long-password'}),/email/);
  await assert.rejects(auth.register({name:'A',email:'a@b.com',password:'short'}),/8–128/);
  await auth.register({name:'A',email:'a@b.com',password:'same-password'});
  await auth.register({name:'B',email:'b@b.com',password:'same-password'});
  const [a,b]=JSON.parse(storage.getItem('sense-demo-accounts-v1'));
  assert.notEqual(a.salt,b.salt);assert.notEqual(a.hash,b.hash);
});
test('corrupt or unavailable demo storage never reports successful login',async()=>{
  const storage=memory(),session=memory(),auth=createDemoAuth(storage,session,webcrypto);
  storage.setItem('sense-demo-accounts-v1','invalid');assert.equal(auth.current(),null);
  await assert.rejects(auth.login({email:'a@b.com',password:'password'}));
  assert.equal(session.getItem('sense-demo-session-v1'),null);
});

test('password change requires the current password and replaces the login credential',async()=>{
  const auth=createDemoAuth(memory(),memory(),webcrypto);
  const email='demo@example.com';
  await auth.register({name:'Test',email,password:'old-password'});
  await assert.rejects(auth.changePassword('wrong','new-password'),/incorrect/);
  await auth.changePassword('old-password','new-password');
  auth.logout();
  await assert.rejects(auth.login({email,password:'old-password'}),/incorrect/);
  assert.equal((await auth.login({email,password:'new-password'})).email,email);
});
