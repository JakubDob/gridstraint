import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'tree',
    loadComponent: () =>
      import(
        './components/solver/solver-constraint-tree/solver-constraint-tree.component'
      ).then((module) => module.ConstraintTreeComponent),
  },
  {
    path: '**',
    loadComponent: () =>
      import(
        './components/solver/solver-manager/solver-manager.component'
      ).then((module) => module.SolverManagerComponent),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
