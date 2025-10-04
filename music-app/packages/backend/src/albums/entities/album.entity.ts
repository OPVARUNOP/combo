import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Artist } from '../../artists/entities/artist.entity';
import { Track } from '../../tracks/entities/track.entity';

export enum AlbumType {
  ALBUM = 'album',
  SINGLE = 'single',
  EP = 'ep',
  COMPILATION = 'compilation',
  LIVE = 'live',
}

@Entity('albums')
export class Album {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'varchar', length: 4, nullable: true })
  releaseYear: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  coverImage: string;

  @Column({ 
    type: 'enum', 
    enum: AlbumType, 
    default: AlbumType.ALBUM 
  })
  type: AlbumType;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  genres: string[];

  @Column({ type: 'int', default: 0 })
  trackCount: number;

  @Column({ type: 'int', default: 0 })
  duration: number; // in seconds

  @Column({ type: 'int', default: 0 })
  likeCount: number;

  @Column({ type: 'int', default: 0 })
  playCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Artist, artist => artist.albums, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'artistId' })
  artist: Artist;

  @Column({ nullable: true })
  artistId: string;

  @OneToMany(() => Track, track => track.album)
  tracks: Track[];

  // Helper methods
  updateTrackCount(): void {
    this.trackCount = this.tracks?.length || 0;
  }

  updateDuration(): void {
    if (!this.tracks) return;
    this.duration = this.tracks.reduce((total, track) => total + (track.duration || 0), 0);
  }

  getFormattedDuration(): string {
    const totalSeconds = this.duration;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  }
}
