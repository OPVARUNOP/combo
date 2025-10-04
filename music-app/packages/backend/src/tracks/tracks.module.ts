import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TracksService } from './tracks.service';
import { TracksController } from './tracks.controller';
import { Track } from './entities/track.entity';
import { ArtistsModule } from '../artists/artists.module';
import { AlbumsModule } from '../albums/albums.module';
import { PlaylistsModule } from '../playlists/playlists.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Track]),
    ArtistsModule,
    AlbumsModule,
    PlaylistsModule,
  ],
  controllers: [TracksController],
  providers: [TracksService],
  exports: [TracksService],
})
export class TracksModule {}
