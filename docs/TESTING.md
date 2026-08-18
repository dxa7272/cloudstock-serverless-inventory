# CloudStock Testing Checklist

## Products

- [ ] GET /products returns products
- [ ] GET /products/{productId} returns one product
- [ ] Invalid product returns 404
- [ ] ADMIN can create product
- [ ] EMPLOYEE cannot create product
- [ ] ADMIN can edit product
- [ ] ADMIN can delete product
- [ ] Stock can increase
- [ ] Stock can decrease
- [ ] Stock cannot become negative

## Orders

- [ ] ADMIN can create order
- [ ] EMPLOYEE can create order
- [ ] Anonymous user cannot create order
- [ ] Product must exist
- [ ] Quantity must be greater than 0
- [ ] Cannot order more than available stock
- [ ] Successful order reduces inventory
- [ ] Successful order appears in order history
- [ ] ADMIN can view all orders
- [ ] EMPLOYEE cannot view all orders

## Analytics

- [ ] ADMIN can view analytics
- [ ] EMPLOYEE cannot view analytics
- [ ] Revenue increases after order
- [ ] Order count increases after order
- [ ] Products sold increases after order
- [ ] Low stock count is accurate

## Authentication

- [ ] Valid ADMIN login works
- [ ] Valid EMPLOYEE login works
- [ ] Invalid password fails
- [ ] Protected API requires JWT
- [ ] ADMIN group is recognized
- [ ] EMPLOYEE group is recognized

## Images

- [ ] Product image URL is returned
- [ ] Image displays in React
- [ ] S3 bucket remains private
- [ ] Missing image does not break page

## Monitoring

- [ ] Lambda executions appear in CloudWatch
- [ ] Errors appear in CloudWatch logs
- [ ] API failures return sensible status codes