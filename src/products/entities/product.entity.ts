import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entty";


@Entity({ name: 'products' })
export class Product {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true,
    })
    title: string;


    @Column('float', {
        default: 0
    })
    price: number;

    @Column({    // otra forma de hacerlo
        type: 'text',
        nullable: true
    })
    description: string;


    @Column('text', {
        unique: true
    })
    slug: string;


    @Column('int', {
        default: 0
    })
    stock: number;

    @Column('text', {
        array: true
    })
    sizes: string[];


    @Column('text')
    gender: string;

    @Column({
        type: 'text',
        array: true,
        default: []
    })
    tags: string[]

    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        { cascade: true, eager: true }
    )
    images?: ProductImage[];

    @BeforeInsert()
    checkSlugInsert() {
        if (!this.slug) {
            this.slug = this.title

        }
        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ', '-')
            .replaceAll("'", '')

    }


    @BeforeUpdate()
    checkSlugUpdate() {
        // siempre tenermos slug antes de update 
        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ', '-')
            .replaceAll("'", '')

    }

}
