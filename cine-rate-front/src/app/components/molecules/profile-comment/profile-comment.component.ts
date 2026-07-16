import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserComment } from '../../../data/mock-data';

@Component({
  selector: 'app-profile-comment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-comment.component.html',
  styleUrls: ['./profile-comment.component.scss']
})
export class ProfileCommentComponent {
  @Input() comment!: UserComment;
}