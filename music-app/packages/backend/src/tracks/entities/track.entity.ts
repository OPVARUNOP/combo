import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, ManyToOne } from 'typeorm';
import { Album } from '../../albums/entities/album.entity';
import { Artist } from '../../artists/entities/artist.entity';
import { Playlist } from '../../playlists/entities/playlist.entity';

export enum TrackStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('tracks')
export class Track {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'int', default: 0 })
  duration: number; // in seconds

  @Column({ type: 'text', nullable: true })
  lyrics: string;

  @Column({ type: 'int', default: 0 })
  playCount: number;

  @Column({ type: 'int', default: 0 })
  likeCount: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  audioUrl: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  coverImage: string;

  @Column({ type: 'boolean', default: false })
  isExplicit: boolean;

  @Column({ 
    type: 'enum', 
    enum: TrackStatus, 
    default: TrackStatus.DRAFT 
  })
  status: TrackStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Album, album => album.tracks)
  album: Album;

  @ManyToMany(() => Artist, artist => artist.tracks)
  @JoinTable()
  artists: Artist[];

  @ManyToMany(() => Playlist, playlist => playlist.tracks)
  playlists: Playlist[];

  // Helper methods
  getFormattedDuration(): string {
    const minutes = Math.floor(this.duration / 60);
    const seconds = this.duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}
