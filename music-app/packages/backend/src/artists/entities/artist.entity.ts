import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { Album } from '../../albums/entities/album.entity';
import { Track } from '../../tracks/entities/track.entity';
import { User } from '../../users/entities/user.entity';

export enum ArtistType {
  SOLO = 'solo',
  BAND = 'band',
  ENSEMBLE = 'ensemble',
  ORCHESTRA = 'orchestra',
}

@Entity('artists')
export class Artist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  country: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  coverImage: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  profileImage: string;

  @Column({ 
    type: 'enum', 
    enum: ArtistType, 
    default: ArtistType.SOLO 
  })
  type: ArtistType;

  @Column({ type: 'jsonb', nullable: true })
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    spotify?: string;
    appleMusic?: string;
    soundcloud?: string;
    bandcamp?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  genres: string[];

  @Column({ type: 'int', default: 0 })
  followerCount: number;

  @Column({ type: 'int', default: 0 })
  monthlyListeners: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Album, album => album.artist)
  albums: Album[];

  @ManyToMany(() => Track, track => track.artists)
  tracks: Track[];

  @ManyToMany(() => User, user => user.followedArtists)
  followers: User[];

  // Helper methods
  addFollower(user: User): void {
    if (!this.followers) {
      this.followers = [];
    }
    this.followers.push(user);
    this.followerCount = this.followers.length;
  }

  removeFollower(userId: string): void {
    if (this.followers) {
      this.followers = this.followers.filter(user => user.id !== userId);
      this.followerCount = this.followers.length;
    }
  }
}
