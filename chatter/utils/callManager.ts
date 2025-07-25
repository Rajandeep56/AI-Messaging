import * as FileSystem from 'expo-file-system';

const CALLS_FILE = FileSystem.documentDirectory + 'calls.json';

export interface Call {
  id: string;
  contactId: string;
  contactName: string;
  contactAvatar: string;
  type: 'incoming' | 'outgoing' | 'missed';
  callMode: 'voice' | 'video';
  duration?: number; // in seconds
  timestamp: string;
  status: 'completed' | 'missed' | 'declined' | 'busy';
}

export interface CallSession {
  id: string;
  contactId: string;
  contactName: string;
  contactAvatar: string;
  callMode: 'voice' | 'video';
  startTime: string;
  isActive: boolean;
  isMuted: boolean;
  isSpeakerOn: boolean;
  isVideoEnabled: boolean;
}

class CallManager {
  private static instance: CallManager;
  private calls: { [key: string]: Call } = {};
  private currentCall: CallSession | null = null;
  private initialized = false;

  private constructor() {}

  static getInstance(): CallManager {
    if (!CallManager.instance) {
      CallManager.instance = new CallManager();
    }
    return CallManager.instance;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      const fileInfo = await FileSystem.getInfoAsync(CALLS_FILE);
      if (fileInfo.exists) {
        const data = await FileSystem.readAsStringAsync(CALLS_FILE);
        this.calls = JSON.parse(data);
      } else {
        this.calls = {};
        await this.saveCalls();
      }
    } catch (error) {
      console.error('Failed to initialize CallManager:', error);
      this.calls = {};
    }

    this.initialized = true;
  }

  private async saveCalls() {
    try {
      await FileSystem.writeAsStringAsync(CALLS_FILE, JSON.stringify(this.calls, null, 2));
    } catch (error) {
      console.error('Failed to save calls:', error);
    }
  }

  async getAllCalls(): Promise<{ [key: string]: Call }> {
    if (!this.initialized) await this.initialize();
    return this.calls;
  }

  async getCallsForContact(contactId: string): Promise<Call[]> {
    if (!this.initialized) await this.initialize();
    return Object.values(this.calls).filter(call => call.contactId === contactId);
  }

  async addCall(call: Omit<Call, 'id'>): Promise<Call> {
    if (!this.initialized) await this.initialize();

    const newCall: Call = {
      ...call,
      id: Date.now().toString(),
    };

    this.calls[newCall.id] = newCall;
    await this.saveCalls();
    return newCall;
  }

  async startCall(contactId: string, contactName: string, contactAvatar: string, callMode: 'voice' | 'video'): Promise<CallSession> {
    const session: CallSession = {
      id: Date.now().toString(),
      contactId,
      contactName,
      contactAvatar,
      callMode,
      startTime: new Date().toISOString(),
      isActive: true,
      isMuted: false,
      isSpeakerOn: false,
      isVideoEnabled: callMode === 'video',
    };

    this.currentCall = session;
    
    // Add outgoing call to history
    await this.addCall({
      contactId,
      contactName,
      contactAvatar,
      type: 'outgoing',
      callMode,
      timestamp: session.startTime,
      status: 'completed',
    });

    return session;
  }

  async receiveCall(contactId: string, contactName: string, contactAvatar: string, callMode: 'voice' | 'video'): Promise<CallSession> {
    const session: CallSession = {
      id: Date.now().toString(),
      contactId,
      contactName,
      contactAvatar,
      callMode,
      startTime: new Date().toISOString(),
      isActive: true,
      isMuted: false,
      isSpeakerOn: false,
      isVideoEnabled: callMode === 'video',
    };

    this.currentCall = session;
    return session;
  }

  async answerCall(): Promise<void> {
    if (!this.currentCall) return;

    // Add incoming call to history
    await this.addCall({
      contactId: this.currentCall.contactId,
      contactName: this.currentCall.contactName,
      contactAvatar: this.currentCall.contactAvatar,
      type: 'incoming',
      callMode: this.currentCall.callMode,
      timestamp: this.currentCall.startTime,
      status: 'completed',
    });
  }

  async declineCall(): Promise<void> {
    if (!this.currentCall) return;

    // Add missed call to history
    await this.addCall({
      contactId: this.currentCall.contactId,
      contactName: this.currentCall.contactName,
      contactAvatar: this.currentCall.contactAvatar,
      type: 'incoming',
      callMode: this.currentCall.callMode,
      timestamp: this.currentCall.startTime,
      status: 'missed',
    });

    this.currentCall = null;
  }

  async endCall(): Promise<void> {
    if (!this.currentCall) return;

    const duration = Math.floor((Date.now() - new Date(this.currentCall.startTime).getTime()) / 1000);
    
    // Update the call with duration
    const callId = Object.keys(this.calls).find(id => 
      this.calls[id].contactId === this.currentCall!.contactId && 
      this.calls[id].timestamp === this.currentCall!.startTime
    );

    if (callId) {
      this.calls[callId].duration = duration;
      await this.saveCalls();
    }

    this.currentCall = null;
  }

  getCurrentCall(): CallSession | null {
    return this.currentCall;
  }

  async toggleMute(): Promise<void> {
    if (this.currentCall) {
      this.currentCall.isMuted = !this.currentCall.isMuted;
    }
  }

  async toggleSpeaker(): Promise<void> {
    if (this.currentCall) {
      this.currentCall.isSpeakerOn = !this.currentCall.isSpeakerOn;
    }
  }

  async toggleVideo(): Promise<void> {
    if (this.currentCall && this.currentCall.callMode === 'video') {
      this.currentCall.isVideoEnabled = !this.currentCall.isVideoEnabled;
    }
  }

  // Simulate incoming call for testing
  async simulateIncomingCall(contactId: string, contactName: string, contactAvatar: string, callMode: 'voice' | 'video' = 'voice'): Promise<CallSession> {
    return this.receiveCall(contactId, contactName, contactAvatar, callMode);
  }

  // Get call statistics
  async getCallStats(): Promise<{
    totalCalls: number;
    totalDuration: number;
    missedCalls: number;
    voiceCalls: number;
    videoCalls: number;
  }> {
    if (!this.initialized) await this.initialize();

    const calls = Object.values(this.calls);
    const totalCalls = calls.length;
    const totalDuration = calls.reduce((sum, call) => sum + (call.duration || 0), 0);
    const missedCalls = calls.filter(call => call.status === 'missed').length;
    const voiceCalls = calls.filter(call => call.callMode === 'voice').length;
    const videoCalls = calls.filter(call => call.callMode === 'video').length;

    return {
      totalCalls,
      totalDuration,
      missedCalls,
      voiceCalls,
      videoCalls,
    };
  }
}

export default CallManager; 