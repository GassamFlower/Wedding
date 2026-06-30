function i(t){if(!t)return"";const e=new Date(t);return isNaN(e.getTime())?String(t):e.toLocaleDateString("zh-CN",{year:"numeric",month:"2-digit",day:"2-digit"})}export{i as f};
