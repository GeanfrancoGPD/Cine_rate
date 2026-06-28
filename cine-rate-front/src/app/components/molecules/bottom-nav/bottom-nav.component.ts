import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavItemComponent } from '../../atom/nav-item/nav-item.component';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, NavItemComponent],
  templateUrl: 'bottom-nav.component.html',
  styleUrls: ['bottom-nav.component.scss']
})
export class BottomNavComponent {
  activeTab: 'home' | 'activity' | 'profile' = 'home';
  @Output() tabChange = new EventEmitter<'home' | 'activity' | 'profile'>();
  private routerSub?: Subscription;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.syncActiveWithUrl(this.router.url);
    this.routerSub = this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd) {
        this.syncActiveWithUrl(ev.urlAfterRedirects || ev.url);
      }
    });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  private syncActiveWithUrl(url: string) {
    if (url.includes('/profile')) {
      this.activeTab = 'profile';
    } else if (url.includes('/activity')) {
      this.activeTab = 'activity';
    } else if (url.includes('/home')) {
      this.activeTab = 'home';
    } else {
      // default/fallback
      this.activeTab = 'home';
    }
  }
}