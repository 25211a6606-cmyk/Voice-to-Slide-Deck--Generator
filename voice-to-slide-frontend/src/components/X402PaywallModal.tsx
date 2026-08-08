'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, ExternalLink, CheckCircle, Zap, Wallet, ArrowUpRight, RefreshCw, Layers, AlertTriangle } from 'lucide-react';
import { luteWalletService, getLuteProvider, LuteAccount, RealTxResult } from '@/services/luteWallet';

interface X402PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPayment: (payerAddress: string, txResult?: RealTxResult) => void;
  endpoint?: string;
  price?: string;
  walletAddress?: string;
}

export default function X402PaywallModal({
  isOpen,
  onClose,
  onConfirmPayment,
  endpoint = 'POST /generateSlides',
  price = '$0.01 USD (1000 microAlgos)',
  walletAddress = 'ZDZ4KU5CGG5FAHDALMMGJ27AN6BQ7CGTZV5HY2P5EGFHHHUFLDSRJHZZDE',
}: X402PaywallModalProps) {
  const [luteAccount, setLuteAccount] = useState<LuteAccount | null>(null);
  const [customLuteAddress, setCustomLuteAddress] = useState(walletAddress);
  const [detectedProvider, setDetectedProvider] = useState<{ name: string } | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isExecutingTx, setIsExecutingTx] = useState(false);
  const [txStep, setTxStep] = useState<string>('');
  const [txResult, setTxResult] = useState<RealTxResult | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const provider = getLuteProvider();
      setDetectedProvider(provider ? { name: provider.name } : null);

      const active = luteWalletService.getConnectedAccount();
      if (active) {
        setLuteAccount(active);
        setCustomLuteAddress(active.address);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConnectLute = async () => {
    setIsConnecting(true);
    try {
      const account = await luteWalletService.connectLuteWallet(customLuteAddress);
      setLuteAccount(account);
      setCustomLuteAddress(account.address);
    } catch (err: any) {
      setTxError(`[Wallet Connection Error] ${err.message || err}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleExecuteRealPayment = async () => {
    setIsExecutingTx(true);
    setTxError(null);
    setTxStep('Step 1/4: Validating wallet provider & network...');

    try {
      setTxStep('Step 2/4: Querying Algorand TestNet node parameters...');
      const result = await luteWalletService.executeRealAlgorandTransaction(
        customLuteAddress,
        walletAddress,
        1000
      );

      setTxStep('Step 3/4: Proof generated! Verifying x402 payment gateway...');
      setTxResult(result);

      setTxStep('Step 4/4: Payment Verified! Unlocking AI presentation service...');
      setTimeout(() => {
        onConfirmPayment(customLuteAddress, result);
      }, 1000);
    } catch (err: any) {
      console.error('[x402 Payment Process Error]', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      setTxError(errMsg);
    } finally {
      setIsExecutingTx(false);
      setTxStep('');
    }
  };

  const alloAccountUrl = `https://allo.info/account/${customLuteAddress || walletAddress}`;
  const peraAccountUrl = `https://testnet.explorer.perawallet.app/address/${customLuteAddress || walletAddress}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md glass-panel rounded-3xl p-6 border-2 border-violet-500/50 shadow-2xl shadow-violet-950/80 space-y-5 relative overflow-hidden">
        {/* Top Header Badge */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-600/30 border border-violet-500/50 flex items-center justify-center text-cyan-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-100 tracking-tight">BlockHack x402 Gateway</h3>
              <p className="text-[10px] text-violet-400 font-mono">Algorand TestNet Protocol</p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-800/50 text-[10px] font-bold font-mono uppercase tracking-wider flex items-center gap-1">
            <Lock className="w-3 h-3" />
            402 Payment Required
          </span>
        </div>

        {/* Lute Wallet Provider Status */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-cyan-400" />
              <span>Algorand Wallet Status</span>
            </span>

            {detectedProvider ? (
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/40 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> {detectedProvider.name}
              </span>
            ) : (
              <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-800/40">
                Extension Not Injected
              </span>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <label className="text-slate-400">Payer Address (TestNet):</label>
              {luteAccount?.balanceMicroAlgos !== undefined && (
                <span className="text-emerald-400 font-mono font-bold">
                  {(luteAccount.balanceMicroAlgos / 1e6).toFixed(3)} ALGO
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customLuteAddress}
                onChange={(e) => setCustomLuteAddress(e.target.value)}
                placeholder="Enter Lute Wallet Address..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 font-mono text-[10px] text-slate-200 focus:outline-none focus:border-violet-500"
              />
              <button
                onClick={handleConnectLute}
                disabled={isConnecting}
                className="text-[10px] font-bold text-white bg-violet-600 hover:bg-violet-500 px-2.5 py-1.5 rounded-xl transition-colors shrink-0"
              >
                {isConnecting ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          </div>
        </div>

        {/* Payment Details Box */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Protected Endpoint:</span>
            <span className="font-mono text-cyan-300 font-semibold">{endpoint}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Micropayment Price:</span>
            <span className="font-mono text-emerald-400 font-extrabold text-sm">{price}</span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
            <span className="text-slate-400">PayTo Address:</span>
            <span className="font-mono text-slate-300 text-[10px] truncate max-w-[180px]">{walletAddress}</span>
          </div>
        </div>

        {/* Active Stage Indicator */}
        {isExecutingTx && (
          <div className="p-3 rounded-2xl bg-violet-950/60 border border-violet-500/40 text-xs flex items-center gap-2.5 animate-pulse">
            <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
            <span className="text-cyan-200 font-semibold text-[11px]">{txStep}</span>
          </div>
        )}

        {/* Detailed Diagnostic Error Box */}
        {txError && (
          <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-500/50 space-y-2 text-xs animate-fade-in">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-rose-200 font-bold">x402 Payment Pipeline Diagnostics</h4>
                <p className="text-rose-200/90 text-[11px] mt-1 leading-relaxed whitespace-pre-wrap">{txError}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-rose-900/60 text-[10px] text-rose-300/80 space-y-1">
              <p className="font-semibold text-rose-200">Recommended Resolution:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Check that Lute Wallet browser extension is installed & unlocked</li>
                <li>Verify your account has &gt; 0.002 TestNet ALGO for fees</li>
                <li>Approve the transaction popup when prompted by Lute Wallet</li>
              </ul>
            </div>
          </div>
        )}

        {/* Real Transaction Result Box */}
        {txResult && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-2 text-xs animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-emerald-300 font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Algorand Tx Signed & Verified
              </span>
              <span className="text-[10px] font-mono text-slate-400">TxID: {txResult.txId.substring(0, 10)}...</span>
            </div>
            <a
              href={txResult.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-[11px] text-cyan-300 font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>View Tx on Allo Explorer</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Working Algorand Explorer Links */}
        <div className="space-y-1.5 pt-1">
          <div className="text-[10px] text-slate-400 font-semibold">View Account on Algorand TestNet Explorers:</div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <a
              href={alloAccountUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-violet-500/40 text-cyan-300 font-mono text-[10px] flex items-center justify-between transition-colors"
            >
              <span>Allo.info Explorer</span>
              <ArrowUpRight className="w-3 h-3 text-slate-400" />
            </a>
            <a
              href={peraAccountUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-violet-500/40 text-cyan-300 font-mono text-[10px] flex items-center justify-between transition-colors"
            >
              <span>Pera Explorer</span>
              <ArrowUpRight className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleExecuteRealPayment}
            disabled={isExecutingTx}
            className="w-full py-3.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 transition-all"
          >
            {isExecutingTx ? (
              <>
                <RefreshCw className="w-4 h-4 text-cyan-300 animate-spin" />
                <span>Executing Stage Checklist...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>Sign & Submit x402 Proof via Lute Wallet</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl font-semibold text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel Request
          </button>
        </div>

        <div className="text-center">
          <a
            href="https://bank.testnet.algorand.network/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-violet-400 transition-colors"
          >
            <span>Get TestNet ALGO from Algorand Dispenser Faucet</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
