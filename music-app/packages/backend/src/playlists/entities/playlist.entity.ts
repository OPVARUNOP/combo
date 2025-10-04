import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Track } from '../../tracks/entities/track.entity';

export enum PlaylistVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  UNLISTED = 'unlisted',
}

@Entity('playlists')
export class Playlist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  coverImage: string;

  @Column({ 
    type: 'enum', 
    enum: PlaylistVisibility, 
    default: PlaylistVisibility.PRIVATE 
  })
  visibility: PlaylistVisibility;

  @Column({ type: 'int', default: 0 })
  trackCount: number;

  @Column({ type: 'int', default: 0 })
  likeCount: number;

  @Column({ type: 'int', default: 0 })
  playCount: number;

  @Column({ type: 'jsonb', nullable: true })
  collaborators: string[]; // Array of user IDs

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, user => user.playlists)
  user: User;

  @ManyToMany(() => Track, track => track.playlists)
  @JoinTable()
  tracks: Track[];

  // Helper methods
  isCollaborator(userId: string): boolean {
    return this.collaborators?.includes(userId) || false;
  }

  canView(userId: string): boolean {
    if (this.visibility === PlaylistVisibility.PUBLIC) return true;
    if (this.visibility === PlaylistVisibility.UNLISTED) return true;
    return this.user.id === userId || this.isCollaborator(userId);
  }
}
