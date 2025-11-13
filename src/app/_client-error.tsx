
'use client';
import React from 'react';
export default class ClientErrorBoundary extends React.Component<React.PropsWithChildren> {
  state = { e: null as any };
  static getDerivedStateFromError(e:any){ return { e }; }
  componentDidCatch(e:any, info:any){ console.error('Client crash:', e, info); }
  render(){ return this.state.e ? <pre style={{whiteSpace:'pre-wrap',padding:12,background:'#fff3f3',border:'1px solid #f99',borderRadius:8}}>
    {String(this.state.e?.message || this.state.e)}
  </pre> : this.props.children as any; }
}
