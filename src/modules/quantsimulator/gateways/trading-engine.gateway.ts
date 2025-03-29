import { 
  WebSocketGateway, 
  WebSocketServer, 
  SubscribeMessage, 
  OnGatewayConnection, 
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody 
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { TradingEngineService } from '../services/trading-engine.service';

@WebSocketGateway({
  namespace: 'trading-engine',
  cors: {
    origin: '*',
  },
})
export class TradingEngineGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  
  private readonly logger = new Logger(TradingEngineGateway.name);
  private clientRooms = new Map<string, string[]>(); // Client ID -> Room IDs
  private roomClients = new Map<string, string[]>(); // Room ID -> Client IDs

  constructor(private readonly tradingEngineService: TradingEngineService) {}

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
    // Initialize empty arrays for this client
    this.clientRooms.set(client.id, []);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Clean up room memberships
    const rooms = this.clientRooms.get(client.id) || [];
    rooms.forEach(room => {
      const clients = this.roomClients.get(room) || [];
      this.roomClients.set(room, clients.filter(id => id !== client.id));
      
      // Notify remaining clients about disconnection
      this.server.to(room).emit('client-disconnected', { clientId: client.id });
    });
    
    // Remove client from our tracking
    this.clientRooms.delete(client.id);
  }

  @SubscribeMessage('join-simulation')
  handleJoinSimulation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string }
  ): void {
    const roomId = `simulation:${data.sessionId}`;
    
    // Join the socket.io room
    client.join(roomId);
    
    // Update our tracking maps
    const clientRooms = this.clientRooms.get(client.id) || [];
    if (!clientRooms.includes(roomId)) {
      clientRooms.push(roomId);
      this.clientRooms.set(client.id, clientRooms);
    }
    
    const roomClients = this.roomClients.get(roomId) || [];
    if (!roomClients.includes(client.id)) {
      roomClients.push(client.id);
      this.roomClients.set(roomId, roomClients);
    }
    
    this.logger.log(`Client ${client.id} joined simulation: ${data.sessionId}`);
    
    // Notify other clients in the room
    client.to(roomId).emit('client-joined', { 
      clientId: client.id,
      sessionId: data.sessionId,
      totalClients: roomClients.length
    });
  }

  @SubscribeMessage('leave-simulation')
  handleLeaveSimulation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string }
  ): void {
    const roomId = `simulation:${data.sessionId}`;
    
    // Leave the socket.io room
    client.leave(roomId);
    
    // Update our tracking maps
    const clientRooms = this.clientRooms.get(client.id) || [];
    this.clientRooms.set(client.id, clientRooms.filter(id => id !== roomId));
    
    const roomClients = this.roomClients.get(roomId) || [];
    this.roomClients.set(roomId, roomClients.filter(id => id !== client.id));
    
    this.logger.log(`Client ${client.id} left simulation: ${data.sessionId}`);
    
    // Notify other clients in the room
    client.to(roomId).emit('client-left', { 
      clientId: client.id,
      sessionId: data.sessionId,
      totalClients: this.roomClients.get(roomId)?.length || 0
    });
  }

  // Broadcast simulation updates to all connected clients in a simulation room
  broadcastSimulationUpdate(sessionId: string, data: any): void {
    const roomId = `simulation:${sessionId}`;
    this.server.to(roomId).emit('simulation-update', data);
    this.logger.debug(`Broadcasted update to simulation: ${sessionId}`);
  }
} 