# ORM vs 原生 SQL 对比

## 概述

在 Serverless 应用中，你可以选择使用 ORM（如 Sequelize）或原生 SQL。两种方式各有优缺点。

## 代码对比

### 1. 获取产品列表

#### 原生 SQL 方式

```typescript
// 需要手写复杂的 SQL 查询
const query = `
  SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p."originalPrice",
    p.stock,
    p."imageUrl",
    p."createdAt",
    p."updatedAt",
    c.name as category_name,
    c.id as category_id
  FROM "Products" p
  LEFT JOIN "Categories" c ON p."categoryId" = c.id
  ORDER BY p."createdAt" DESC
`;

const products = await queryPostgreSQL(query);

// 需要手动格式化数据
const formattedProducts = products.map((product) => ({
  id: product.id,
  name: product.name,
  price: parseFloat(product.price),
  category: product.category_name || 'Uncategorized',
  // ... 更多字段
}));
```

#### ORM 方式 (Sequelize)

```typescript
// 简洁的 ORM 查询
const products = await Product.findAll({
  include: [
    {
      model: Category,
      as: 'category',
      attributes: ['id', 'name'],
    },
  ],
  order: [['createdAt', 'DESC']],
});

// 自动格式化，使用模型的计算属性
const formattedProducts = products.map((product) => ({
  id: product.id,
  name: product.name,
  price: parseFloat(product.price.toString()),
  category: product.category?.name || 'Uncategorized',
  inStock: product.inStock, // 计算属性
  discountPercentage: product.discountPercentage, // 计算属性
  // ... 其他字段自动映射
}));
```

### 2. 创建产品

#### 原生 SQL 方式

```typescript
// 复杂的 INSERT 查询
const insertQuery = `
  INSERT INTO "Products" (
    name, description, price, "originalPrice", "categoryId", stock, "imageUrl", "createdAt", "updatedAt"
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
  RETURNING *
`;

const insertParams = [
  name,
  description,
  parseFloat(price),
  originalPrice ? parseFloat(originalPrice) : null,
  categoryId,
  stock || 0,
  imageUrl || null,
];

const newProducts = await queryPostgreSQL(insertQuery, insertParams);
const newProduct = newProducts[0];

// 需要额外查询获取分类信息
const categoryQuery = `SELECT name FROM "Categories" WHERE id = $1`;
const categories = await queryPostgreSQL(categoryQuery, [categoryId]);
```

#### ORM 方式 (Sequelize)

```typescript
// 简单的创建操作
const newProduct = await Product.create({
  name,
  description,
  price: parseFloat(price),
  originalPrice: originalPrice ? parseFloat(originalPrice) : null,
  categoryId,
  stock: stock || 0,
  imageUrl: imageUrl || null,
});

// 自动加载关联数据
const productWithCategory = await Product.findByPk(newProduct.id, {
  include: [{ model: Category, as: 'category' }],
});
```

### 3. 搜索功能

#### 原生 SQL 方式

```typescript
// 复杂的动态 SQL 构建
let query = `
  SELECT p.*, c.name as category_name 
  FROM "Products" p 
  LEFT JOIN "Categories" c ON p."categoryId" = c.id 
  WHERE 1=1
`;
const params = [];
let paramIndex = 1;

if (searchTerm) {
  query += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
  params.push(`%${searchTerm}%`);
  paramIndex++;
}

if (minPrice) {
  query += ` AND p.price >= $${paramIndex}`;
  params.push(parseFloat(minPrice));
  paramIndex++;
}

// ... 更多条件
const results = await queryPostgreSQL(query, params);
```

#### ORM 方式 (Sequelize)

```typescript
// 清晰的查询条件构建
const whereConditions: any = {};

if (q) {
  whereConditions[Op.or] = [
    { name: { [Op.iLike]: `%${q}%` } },
    { description: { [Op.iLike]: `%${q}%` } },
  ];
}

if (minPrice || maxPrice) {
  whereConditions.price = {};
  if (minPrice) whereConditions.price[Op.gte] = parseFloat(minPrice);
  if (maxPrice) whereConditions.price[Op.lte] = parseFloat(maxPrice);
}

const products = await Product.findAll({
  where: whereConditions,
  include: [{ model: Category, as: 'category' }],
});
```

## 优缺点对比

### ORM 优势 ✅

1. **类型安全**: TypeScript 支持，编译时错误检查
2. **代码可读性**: 更接近自然语言，易于理解
3. **关系管理**: 自动处理表关联，减少 JOIN 查询错误
4. **数据验证**: 内置验证规则
5. **计算属性**: 模型层面的业务逻辑
6. **数据库抽象**: 支持多种数据库，易于迁移
7. **防 SQL 注入**: 自动参数化查询
8. **事务支持**: 简化的事务管理
9. **缓存机制**: 内置查询缓存
10. **迁移管理**: 版本化的数据库结构变更

### ORM 劣势 ❌

1. **性能开销**: 额外的抽象层
2. **学习曲线**: 需要学习 ORM 特定语法
3. **复杂查询限制**: 某些复杂 SQL 难以表达
4. **包大小**: 增加应用体积
5. **调试困难**: 生成的 SQL 可能不够优化

### 原生 SQL 优势 ✅

1. **性能**: 直接控制 SQL，可优化到极致
2. **灵活性**: 支持所有 SQL 特性
3. **轻量**: 没有额外的抽象层
4. **调试**: 直接看到执行的 SQL
5. **学习成本**: 如果已熟悉 SQL，无需额外学习

### 原生 SQL 劣势 ❌

1. **安全风险**: 容易出现 SQL 注入
2. **维护困难**: 字符串拼接容易出错
3. **类型安全**: 缺乏编译时检查
4. **重复代码**: 大量相似的 CRUD 操作
5. **数据库绑定**: 难以切换数据库

## 推荐使用场景

### 使用 ORM 的场景 🎯

- **快速开发**: 需要快速构建 MVP
- **团队协作**: 多人开发，需要统一的数据访问层
- **复杂关系**: 多表关联较多
- **类型安全**: TypeScript 项目，需要强类型
- **数据验证**: 需要复杂的业务规则验证
- **长期维护**: 项目需要长期维护和扩展

### 使用原生 SQL 的场景 🎯

- **性能关键**: 对性能有极高要求
- **复杂查询**: 需要复杂的分析查询、存储过程
- **遗留系统**: 已有大量 SQL 代码
- **特定数据库**: 需要使用特定数据库功能
- **简单 CRUD**: 非常简单的数据操作

## 在 Serverless 中的考虑

### 冷启动影响

- **ORM**: 初始化时间较长，但可以通过连接池优化
- **原生 SQL**: 启动更快，但需要手动管理连接

### 内存使用

- **ORM**: 占用更多内存
- **原生 SQL**: 内存占用较少

### 开发效率

- **ORM**: 开发速度更快，维护成本更低
- **原生 SQL**: 初期开发较慢，但运行时性能更好

## 混合使用策略 🔄

你可以在同一个项目中混合使用两种方式：

```typescript
// 简单 CRUD 使用 ORM
export const getProducts = async () => {
  return await Product.findAll({
    include: [Category],
  });
};

// 复杂分析查询使用原生 SQL
export const getProductAnalytics = async () => {
  const query = `
    SELECT 
      DATE_TRUNC('month', "createdAt") as month,
      COUNT(*) as product_count,
      AVG(price) as avg_price,
      SUM(stock) as total_stock
    FROM "Products" 
    WHERE "createdAt" >= NOW() - INTERVAL '12 months'
    GROUP BY DATE_TRUNC('month', "createdAt")
    ORDER BY month DESC
  `;

  return await queryPostgreSQL(query);
};
```

## 总结

对于大多数 Serverless 应用，**推荐使用 ORM**，因为：

1. 开发效率更高
2. 代码更安全、可维护
3. 团队协作更容易
4. 现代 ORM 性能已经足够好

只有在特定场景下（如复杂分析查询、极致性能要求）才考虑使用原生 SQL。

最佳实践是：**以 ORM 为主，原生 SQL 为辅**。
