﻿import { Component } from '@angular/core';

import { AlertService } from '../alert';

@Component({ templateUrl: 'multi-alerts.component.html' })
export class MultiAlertsComponent {
  constructor(public alertService: AlertService) {}
}
