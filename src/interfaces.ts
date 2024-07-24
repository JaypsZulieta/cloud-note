export interface CanRead<TId, TEntity> {
  findById(id: TId): Promise<TEntity>;
  findAll(): Promise<TEntity[]>;
}

export interface CanCheckExistence<TId> {
  existById(id: TId): Promise<boolean>;
}

export interface CanDelete<TId, TEntity> {
  deleteById(id: TId): Promise<TEntity>;
}
