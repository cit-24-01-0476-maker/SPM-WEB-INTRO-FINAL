import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as jose from 'jose';
import * as jsx from 'react/jsx-runtime';
import {renderToStaticMarkup} from 'react-dom/server';
function load(path, extras={}) {
  const context={exports:{},URL,TextEncoder,Uint8Array,Number,process,...extras};
  vm.runInNewContext(ts.transpileModule(readFileSync(new URL(path,import.meta.url),'utf8'),{fileName:path,compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,context);
  return context.exports;
}
const apk=load('../src/lib/apk.ts');
test('APK releases reject empty, oversized and non-APK files',()=>{
  assert.equal(apk.validateApk({name:'SPM.apk',size:58*1024*1024}),null);
  for(const file of [{name:'SPM.exe',size:100},{name:'SPM.apk',size:0},{name:'SPM.apk',size:201*1024*1024}])assert.ok(apk.validateApk(file));
});
test('download links reject unsafe protocols and embedded credentials',()=>{
  for(const url of ['', 'javascript:alert(1)','http://example.com/app.apk','https://user:pass@example.com/app.apk'])assert.equal(apk.apkUrl(url),'');
  assert.equal(apk.apkUrl('https://example.com/app.apk'),'https://example.com/app.apk');
});
const secret='test-upload-session-secret';
function server(fetch) {
  return load('../src/lib/media/apk-upload.server.ts',{
    process:{env:{GOOGLE_REFRESH_TOKEN:secret}},fetch,
    require(name){if(name==='jose')return jose;if(name==='./drive.server')return {getAccessToken:async()=>'test-access',ensureCategoryFolder:async()=>'folder'};if(name==='@/lib/apk')return apk;throw new Error(name);},
  });
}
async function session(claims={},uid='admin-a') {
  return new jose.SignJWT({location:'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&upload_id=test',size:8,name:'app.apk',...claims}).setProtectedHeader({alg:'HS256'}).setSubject(uid).setAudience('spm-apk-upload').setExpirationTime('1h').sign(new TextEncoder().encode(secret));
}
const bytes=new Uint8Array([80,75,3,4,0,0,0,0]).buffer;
test('upload sessions cannot be reused by another admin or redirected to another host',async()=>{
  const upload=server(()=>{throw new Error('Unexpected network request');});
  await assert.rejects(upload.sendApkChunk('admin-b',await session(),0,bytes));
  await assert.rejects(upload.sendApkChunk('admin-a',await session({location:'https://example.com/upload'}),0,bytes));
  await assert.rejects(upload.sendApkChunk('admin-a',await session(),1,bytes));
  await assert.rejects(upload.sendApkChunk('admin-a',await session(),0,new Uint8Array(8).buffer));
});
test('completed APK upload returns a download link only after public read sharing succeeds',async()=>{
  const calls=[];
  const upload=server(async(url,options)=>{calls.push([String(url),options]);return calls.length===1?Response.json({id:'release-id',name:'app.apk'}):Response.json({id:'permission'});});
  const result=await upload.sendApkChunk('admin-a',await session(),0,bytes);
  assert.equal(result.done,true);assert.equal(result.url,'https://drive.google.com/uc?export=download&id=release-id');
  assert.equal(calls[0][1].headers['Content-Range'],'bytes 0-7/8');
  assert.equal(JSON.parse(calls[1][1].body).role,'reader');
});
test('failed sharing never produces a downloadable release',async()=>{
  let count=0;
  const upload=server(async()=>++count===1?Response.json({id:'release-id',name:'app.apk'}):new Response('',{status:403}));
  await assert.rejects(upload.sendApkChunk('admin-a',await session(),0,bytes),/public download/);
});
function downloadMarkup(site) {
  const component=load('../src/components/site/AppDownload.tsx',{
    require(name){
      if(name==='react/jsx-runtime')return jsx;
      if(name==='lucide-react')return new Proxy({},{get:()=>()=>null});
      if(name==='./primitives')return {Container:({children})=>jsx.jsx('div',{children})};
      if(name==='@/lib/cms/PublicSettings')return {usePublicSettings:()=>({site})};
      if(name==='@/lib/i18n/LanguageProvider')return {useLanguage:()=>({lang:'en'})};
      if(name==='@/lib/apk')return apk;
      if(name==='@/lib/media/types')return {formatBytes:size=>String(size)};
      throw new Error(name);
    },
  });
  return renderToStaticMarkup(jsx.jsx(component.AppDownload,{}));
}
test('unreleased or disabled APK stays coming soon without a download link',()=>{
  for(const site of [{apkReleaseManaged:true},{apkDownloadEnabled:false,apkUrl:'https://example.com/app.apk'},{apkDownloadEnabled:true,apkUrl:'javascript:alert(1)'}]){
    const html=downloadMarkup(site);assert.match(html,/Android APK coming soon/);assert.doesNotMatch(html,/download=/);
  }
});

test('bundled release upgrades legacy placeholders and respects explicit admin changes',()=>{
  const html=downloadMarkup({});
  assert.match(html,/href="\/downloads\/SPM-Driver-App-1.0.0.apk"/);
  assert.match(html,/Version 1.0.0/);
  assert.equal(apk.resolveApkRelease({apkReleaseManaged:true,apkDownloadEnabled:false}).apkDownloadEnabled,false);
  assert.equal(apk.resolveApkRelease({apkReleaseManaged:true,apkUrl:''}).apkUrl,'');
  assert.equal(apk.apkUrl('/downloads/SPM-Driver-App-1.0.0.apk'),'/downloads/SPM-Driver-App-1.0.0.apk');
  assert.equal(apk.apkUrl('/other.apk'),'');
});
test('published enabled APK exposes its download link and version',()=>{
  const html=downloadMarkup({apkDownloadEnabled:true,apkUrl:'https://example.com/app.apk',apkVersion:'1.2.0',apkFileName:'SPM.apk',apkFileSize:100});
  assert.match(html,/href="https:\/\/example.com\/app.apk"/);assert.match(html,/download="SPM.apk"/);assert.match(html,/Version 1.2.0/);assert.doesNotMatch(html,/coming soon/);
});
