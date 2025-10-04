import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Playlist } from '../../playlists/entities/playlist.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  email: string;

  @Column({ nullable: true })
  @Exclude()
  password: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  @Exclude()
  refreshToken: string;

  @Column({ type: 'timestamp', nullable: true })
  @Exclude()
  refreshTokenExpires: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Playlist, playlist => playlist.user)
  playlists: Playlist[];

  // Social logins
  @Column({ nullable: true })
  googleId: string;

  @Column({ nullable: true })
  facebookId: string;

  @Column({ nullable: true })
  appleId: string;

  // Helper methods
  get fullName(): string {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim() || this.email.split('@')[0];
  }
}
